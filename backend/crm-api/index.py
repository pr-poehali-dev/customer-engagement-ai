import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


def get_db_connection():
    '''Создает подключение к PostgreSQL'''
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL environment variable is not set')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)


def handler(event: dict, context) -> dict:
    '''Универсальный API для AVT CRM системы с функциями статистики, управления клиентами и звонками'''
    
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Определяем путь из query параметров
        params = event.get('queryStringParameters', {}) or {}
        path = params.get('path', 'stats')
        
        if method == 'GET':
            if path == 'stats':
                result = get_statistics(cursor)
            elif path == 'clients':
                result = get_clients(cursor)
            elif path == 'calls':
                result = get_calls(cursor)
            else:
                result = {'error': 'Unknown path'}
        
        elif method == 'POST':
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if body_str else {}
            
            if path == 'initiate_call':
                result = initiate_call(cursor, conn, body)
            else:
                result = {'error': 'Unknown path'}
        
        else:
            result = {'error': 'Method not allowed'}
        
        cursor.close()
        conn.close()
        
        return success_response(result)
    
    except Exception as e:
        return error_response(str(e))


def get_statistics(cursor):
    '''Получает статистику CRM системы'''
    
    # Общее количество клиентов
    cursor.execute("SELECT COUNT(*) as total FROM clients")
    total_clients = cursor.fetchone()['total']
    
    # Клиенты по статусам
    cursor.execute("""
        SELECT status, COUNT(*) as count 
        FROM clients 
        GROUP BY status
    """)
    clients_by_status = {row['status']: row['count'] for row in cursor.fetchall()}
    
    # Статистика звонков
    cursor.execute("""
        SELECT 
            COUNT(*) as total_calls,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_calls,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_calls,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_calls
        FROM calls
    """)
    calls_stats = cursor.fetchone()
    
    # Email кампании
    cursor.execute("""
        SELECT 
            COUNT(*) as total_campaigns,
            SUM(sent) as total_sent,
            SUM(opened) as total_opened,
            SUM(clicked) as total_clicked
        FROM email_campaigns
    """)
    email_stats = cursor.fetchone()
    
    return {
        'clients': {
            'total': total_clients,
            'by_status': clients_by_status
        },
        'calls': dict(calls_stats),
        'email_campaigns': dict(email_stats)
    }


def get_clients(cursor):
    '''Получает список всех клиентов'''
    
    cursor.execute("""
        SELECT 
            id, name, email, phone, status, 
            last_contact, created_at
        FROM clients
        ORDER BY last_contact DESC
    """)
    
    clients = cursor.fetchall()
    
    # Конвертируем datetime в строки
    for client in clients:
        if client['last_contact']:
            client['last_contact'] = client['last_contact'].isoformat()
        if client['created_at']:
            client['created_at'] = client['created_at'].isoformat()
    
    return {'clients': [dict(c) for c in clients]}


def get_calls(cursor):
    '''Получает историю звонков с информацией о клиентах'''
    
    cursor.execute("""
        SELECT 
            c.id, c.client_id, c.status, c.duration, 
            c.result, c.created_at,
            cl.name as client_name, cl.phone as client_phone
        FROM calls c
        LEFT JOIN clients cl ON c.client_id = cl.id
        ORDER BY c.created_at DESC
    """)
    
    calls = cursor.fetchall()
    
    # Конвертируем datetime в строки
    for call in calls:
        if call['created_at']:
            call['created_at'] = call['created_at'].isoformat()
    
    return {'calls': [dict(c) for c in calls]}


def initiate_call(cursor, conn, body):
    '''Инициирует звонок клиенту через MANGO OFFICE API'''
    
    if not isinstance(body, dict):
        return {'error': 'Invalid body format'}
    
    client_id = body.get('client_id')
    phone = body.get('phone')
    
    if not client_id or not phone:
        return {'error': 'client_id and phone are required'}
    
    # Получаем учетные данные MANGO OFFICE
    vpbx_api_key = os.environ.get('MANGO_VPBX_API_KEY')
    vpbx_api_salt = os.environ.get('MANGO_VPBX_API_SALT')
    from_extension = os.environ.get('MANGO_FROM_EXTENSION')
    from_number = os.environ.get('MANGO_FROM_NUMBER')
    
    if not all([vpbx_api_key, vpbx_api_salt, from_extension]):
        # Если credentials не настроены, создаем запись в БД без реального звонка
        cursor.execute("""
            INSERT INTO calls (client_id, status, duration, result, created_at)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id
        """, (client_id, 'pending', '0:00', 'Ожидание настройки MANGO OFFICE API'))
        
        call_id = cursor.fetchone()['id']
        conn.commit()
        
        return {
            'success': True,
            'call_id': call_id,
            'message': f'Звонок добавлен в очередь. Для совершения реальных звонков настройте MANGO OFFICE API.',
            'status': 'pending',
            'demo_mode': True
        }
    
    # Создаем запись звонка в БД
    cursor.execute("""
        INSERT INTO calls (client_id, status, duration, result, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id
    """, (client_id, 'pending', '0:00', 'Инициируется...'))
    
    call_id = cursor.fetchone()['id']
    conn.commit()
    
    try:
        import urllib.request
        import urllib.parse
        import hashlib
        import json as json_lib
        
        # Подготовка данных для API MANGO OFFICE
        # Документация: https://www.mango-office.ru/support/api/
        
        # Формируем JSON запрос
        command_id = f"call_{call_id}_{int(datetime.now().timestamp())}"
        
        request_data = {
            "command_id": command_id,
            "from": {
                "extension": from_extension,
                "number": from_number or phone
            },
            "to_number": phone,
            "line_number": from_number or "",
            "sip_headers": {}
        }
        
        json_request = json_lib.dumps(request_data, ensure_ascii=False)
        
        # Вычисляем sign (hash)
        sign_string = vpbx_api_key + json_request + vpbx_api_salt
        sign = hashlib.sha256(sign_string.encode('utf-8')).hexdigest()
        
        # Отправляем POST запрос к MANGO OFFICE API
        url = 'https://app.mango-office.ru/vpbx/commands/callback'
        
        data = urllib.parse.urlencode({
            'vpbx_api_key': vpbx_api_key,
            'sign': sign,
            'json': json_request
        }).encode('utf-8')
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        request = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(request, timeout=10) as response:
            result = json_lib.loads(response.read().decode('utf-8'))
            
            # Обновляем запись звонка
            cursor.execute("""
                UPDATE calls 
                SET status = %s, result = %s
                WHERE id = %s
            """, ('success', f'Звонок инициирован через MANGO OFFICE (command_id: {command_id})', call_id))
            conn.commit()
            
            return {
                'success': True,
                'call_id': call_id,
                'mango_command_id': command_id,
                'message': f'Звонок на номер {phone} успешно инициирован через MANGO OFFICE',
                'status': 'success',
                'mango_response': result
            }
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            error_data = json_lib.loads(error_body)
            error_message = error_data.get('message', str(e))
        except:
            error_message = error_body or str(e)
        
        # Обновляем запись об ошибке
        cursor.execute("""
            UPDATE calls 
            SET status = %s, result = %s
            WHERE id = %s
        """, ('failed', f'Ошибка MANGO OFFICE: {error_message}', call_id))
        conn.commit()
        
        return {
            'success': False,
            'call_id': call_id,
            'error': error_message,
            'status': 'failed'
        }
    
    except Exception as e:
        cursor.execute("""
            UPDATE calls 
            SET status = %s, result = %s
            WHERE id = %s
        """, ('failed', f'Ошибка: {str(e)}', call_id))
        conn.commit()
        
        return {
            'success': False,
            'call_id': call_id,
            'error': str(e),
            'status': 'failed'
        }


def success_response(data):
    '''Формирует успешный ответ'''
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False, default=str)
    }


def error_response(error_message):
    '''Формирует ответ с ошибкой'''
    return {
        'statusCode': 500,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': error_message}, ensure_ascii=False)
    }
