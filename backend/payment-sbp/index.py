import json
import os
import hashlib
import base64
from datetime import datetime
import psycopg2
import qrcode
from io import BytesIO

RECIPIENT_PHONE = '89277486868'
RECIPIENT_BANK = 'Sberbank'

def generate_sbp_qr(amount: float, payment_id: str, description: str = '') -> str:
    '''Генерация QR-кода для оплаты через СБП'''
    sbp_url = f"https://qr.nspk.ru/proxyapp?type=02&bank=100000000004&sum={amount}&cur=RUB&payeeId={RECIPIENT_PHONE}&purpose={description}&paymentId={payment_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(sbp_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def handler(event: dict, context) -> dict:
    '''API для оплаты через СБП Сбербанка с генерацией QR-кода'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 't_p3568014_customer_engagement_')
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create_payment')
            
            if action == 'create_payment':
                headers = event.get('headers', {})
                auth_header = headers.get('X-Authorization', headers.get('authorization', ''))
                
                if not auth_header:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Требуется авторизация'}),
                        'isBase64Encoded': False
                    }
                
                token = auth_header.replace('Bearer ', '')
                
                cursor.execute(
                    f"SELECT id, username FROM {schema}.users WHERE session_token = %s AND token_expiry > %s",
                    (token, datetime.now())
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный или истекший токен'}),
                        'isBase64Encoded': False
                    }
                
                user_id = user[0]
                amount = float(body.get('amount', 0))
                description = body.get('description', 'Оплата услуг AVT')
                
                if amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Сумма должна быть больше 0'}),
                        'isBase64Encoded': False
                    }
                
                payment_id = f"AVT-{user_id}-{int(datetime.now().timestamp())}"
                
                qr_code_data = generate_sbp_qr(amount, payment_id, description)
                
                cursor.execute(
                    f"""INSERT INTO {schema}.payments 
                    (user_id, amount, currency, payment_method, phone_number, status, qr_code_url, payment_id, description, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id""",
                    (user_id, amount, 'RUB', 'SBP', RECIPIENT_PHONE, 'pending', qr_code_data, payment_id, description, datetime.now())
                )
                payment_db_id = cursor.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'payment_id': payment_id,
                        'payment_db_id': payment_db_id,
                        'amount': amount,
                        'currency': 'RUB',
                        'recipient_phone': RECIPIENT_PHONE,
                        'recipient_bank': RECIPIENT_BANK,
                        'qr_code': qr_code_data,
                        'status': 'pending',
                        'description': description
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'confirm_payment':
                payment_id = body.get('payment_id')
                
                if not payment_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Требуется payment_id'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    f"UPDATE {schema}.payments SET status = %s, paid_at = %s WHERE payment_id = %s RETURNING id",
                    ('paid', datetime.now(), payment_id)
                )
                result = cursor.fetchone()
                conn.commit()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Платеж не найден'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Платеж подтвержден'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action', 'get_payments')
            
            if action == 'get_payments':
                headers = event.get('headers', {})
                auth_header = headers.get('X-Authorization', headers.get('authorization', ''))
                
                if not auth_header:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Требуется авторизация'}),
                        'isBase64Encoded': False
                    }
                
                token = auth_header.replace('Bearer ', '')
                
                cursor.execute(
                    f"SELECT id FROM {schema}.users WHERE session_token = %s AND token_expiry > %s",
                    (token, datetime.now())
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный или истекший токен'}),
                        'isBase64Encoded': False
                    }
                
                user_id = user[0]
                
                cursor.execute(
                    f"""SELECT id, amount, currency, payment_method, phone_number, status, 
                    payment_id, description, created_at, paid_at 
                    FROM {schema}.payments WHERE user_id = %s ORDER BY created_at DESC""",
                    (user_id,)
                )
                payments = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'payments': [
                            {
                                'id': p[0],
                                'amount': float(p[1]),
                                'currency': p[2],
                                'payment_method': p[3],
                                'phone_number': p[4],
                                'status': p[5],
                                'payment_id': p[6],
                                'description': p[7],
                                'created_at': p[8].isoformat() if p[8] else None,
                                'paid_at': p[9].isoformat() if p[9] else None
                            }
                            for p in payments
                        ]
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
