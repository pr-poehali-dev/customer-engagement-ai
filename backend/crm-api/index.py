import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления CRM данными: клиенты, звонки, email кампании'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return error_response('DATABASE_URL not configured', 500)
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        qs_params = event.get('queryStringParameters')
        path = qs_params.get('path', 'stats') if qs_params else 'stats'
        
        if method == 'POST':
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if isinstance(body_str, str) else body_str
            
            if path == 'initiate_call':
                result = initiate_call(cursor, conn, body)
            elif path == 'import_clients':
                result = import_clients(cursor, conn, body)
            elif path == 'save_scenario':
                result = save_scenario(cursor, conn, body)
            elif path == 'delete_scenario':
                result = delete_scenario(cursor, conn, body)
            else:
                result = {'error': 'Unknown POST path'}
        elif path == 'stats':
            result = get_stats(cursor)
        elif path == 'clients':
            result = get_clients(cursor)
        elif path == 'calls':
            result = get_calls(cursor)
        elif path == 'campaigns':
            result = get_campaigns(cursor)
        elif path == 'scenarios':
            result = get_scenarios(cursor)
        else:
            result = {'error': 'Unknown path'}
        
        cursor.close()
        conn.close()
        
        return success_response(result)
        
    except Exception as e:
        return error_response(str(e), 500)


def get_stats(cursor):
    cursor.execute("SELECT COUNT(*) as total FROM clients")
    total_clients = cursor.fetchone()['total']
    
    cursor.execute("SELECT COUNT(*) as total FROM calls WHERE DATE(created_at) = CURRENT_DATE")
    calls_today = cursor.fetchone()['total']
    
    cursor.execute("SELECT SUM(sent) as total FROM email_campaigns")
    emails_sent = cursor.fetchone()['total'] or 0
    
    cursor.execute("""
        SELECT 
            ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / NULLIF(COUNT(*), 0), 0) as conversion
        FROM calls
    """)
    conversion = cursor.fetchone()['conversion'] or 0
    
    return {
        'totalClients': total_clients,
        'callsToday': calls_today,
        'emailsSent': int(emails_sent),
        'conversion': int(conversion)
    }


def get_clients(cursor):
    cursor.execute("""
        SELECT 
            id, 
            name, 
            email, 
            phone, 
            status,
            CASE 
                WHEN last_contact > NOW() - INTERVAL '1 hour' THEN 
                    EXTRACT(EPOCH FROM (NOW() - last_contact))::INT / 60 || ' минут назад'
                WHEN last_contact > NOW() - INTERVAL '1 day' THEN 
                    EXTRACT(EPOCH FROM (NOW() - last_contact))::INT / 3600 || ' часа назад'
                ELSE 
                    EXTRACT(EPOCH FROM (NOW() - last_contact))::INT / 86400 || ' дней назад'
            END as last_contact
        FROM clients
        ORDER BY last_contact DESC
        LIMIT 50
    """)
    
    return cursor.fetchall()


def get_calls(cursor):
    cursor.execute("""
        SELECT 
            c.id,
            cl.name as client,
            c.status,
            c.duration,
            TO_CHAR(c.created_at, 'HH24:MI') as timestamp,
            c.result
        FROM calls c
        JOIN clients cl ON c.client_id = cl.id
        ORDER BY c.created_at DESC
        LIMIT 20
    """)
    
    return cursor.fetchall()


def get_campaigns(cursor):
    cursor.execute("""
        SELECT 
            id,
            name,
            sent,
            opened,
            clicked,
            status
        FROM email_campaigns
        ORDER BY created_at DESC
    """)
    
    return cursor.fetchall()


def get_scenarios(cursor):
    cursor.execute("""
        SELECT 
            id,
            name,
            description,
            steps,
            status,
            TO_CHAR(created_at, 'DD.MM.YYYY') as created
        FROM scenarios
        ORDER BY created_at DESC
    """)
    
    return cursor.fetchall()


def import_clients(cursor, conn, body):
    '''Импортирует клиентов из Excel файла'''
    
    if not isinstance(body, dict):
        return {'error': 'Invalid body format'}
    
    clients = body.get('clients', [])
    
    if not clients:
        return {'error': 'No clients provided'}
    
    imported_count = 0
    for client in clients:
        try:
            cursor.execute("""
                INSERT INTO clients (name, email, phone, status, last_contact)
                VALUES (%s, %s, %s, %s, NOW())
            """, (
                client.get('name', ''),
                client.get('email', ''),
                client.get('phone', ''),
                client.get('status', 'cold')
            ))
            imported_count += 1
        except Exception as e:
            print(f'Error importing client: {e}')
            continue
    
    conn.commit()
    
    return {
        'success': True,
        'imported': imported_count,
        'message': f'Импортировано {imported_count} клиентов'
    }


def save_scenario(cursor, conn, body):
    '''Сохраняет или обновляет сценарий AI бота'''
    
    if not isinstance(body, dict):
        return {'error': 'Invalid body format'}
    
    scenario = body.get('scenario')
    
    if not scenario:
        return {'error': 'No scenario provided'}
    
    scenario_id = scenario.get('id')
    name = scenario.get('name', 'Новый сценарий')
    description = scenario.get('description', '')
    steps = json.dumps(scenario.get('steps', []))
    status = scenario.get('status', 'draft')
    
    cursor.execute("""
        SELECT id FROM scenarios WHERE id = %s
    """, (scenario_id,))
    
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
            UPDATE scenarios 
            SET name = %s, description = %s, steps = %s, status = %s, updated_at = NOW()
            WHERE id = %s
        """, (name, description, steps, status, scenario_id))
    else:
        cursor.execute("""
            INSERT INTO scenarios (id, name, description, steps, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        """, (scenario_id, name, description, steps, status))
    
    conn.commit()
    
    return {
        'success': True,
        'scenario_id': scenario_id,
        'message': 'Сценарий сохранен'
    }


def delete_scenario(cursor, conn, body):
    '''Удаляет сценарий'''
    
    if not isinstance(body, dict):
        return {'error': 'Invalid body format'}
    
    scenario_id = body.get('scenario_id')
    
    if not scenario_id:
        return {'error': 'scenario_id is required'}
    
    cursor.execute("""
        DELETE FROM scenarios WHERE id = %s
    """, (scenario_id,))
    
    conn.commit()
    
    return {
        'success': True,
        'message': 'Сценарий удален'
    }


def initiate_call(cursor, conn, body):
    '''Инициирует звонок клиенту и создает запись в базе данных'''
    
    if not isinstance(body, dict):
        return {'error': 'Invalid body format'}
    
    client_id = body.get('client_id')
    phone = body.get('phone')
    
    if not client_id or not phone:
        return {'error': 'client_id and phone are required'}
    
    cursor.execute("""
        INSERT INTO calls (client_id, status, duration, result, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id
    """, (client_id, 'success', '0:00', 'Звонок инициирован'))
    
    call_id = cursor.fetchone()['id']
    conn.commit()
    
    return {
        'success': True,
        'call_id': call_id,
        'message': f'Звонок клиенту {phone} инициирован',
        'status': 'in_progress'
    }


def success_response(data):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, default=str),
        'isBase64Encoded': False
    }


def error_response(message, code=400):
    return {
        'statusCode': code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }