import json
import os
import hashlib
import re
import secrets
import time
from datetime import datetime, timedelta
import psycopg2

RATE_LIMIT = {}
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 300

def get_client_ip(event: dict) -> str:
    '''Получить IP-адрес клиента'''
    headers = event.get('headers', {})
    forwarded = headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')

def check_rate_limit(ip: str) -> tuple:
    '''Проверка лимита попыток входа'''
    current_time = time.time()
    
    if ip not in RATE_LIMIT:
        RATE_LIMIT[ip] = {'attempts': 1, 'lockout_until': None}
        return True, 0
    
    rate_data = RATE_LIMIT[ip]
    
    if rate_data['lockout_until'] and current_time < rate_data['lockout_until']:
        remaining = int(rate_data['lockout_until'] - current_time)
        return False, remaining
    
    if rate_data['lockout_until'] and current_time >= rate_data['lockout_until']:
        RATE_LIMIT[ip] = {'attempts': 1, 'lockout_until': None}
        return True, 0
    
    rate_data['attempts'] += 1
    
    if rate_data['attempts'] > MAX_ATTEMPTS:
        rate_data['lockout_until'] = current_time + LOCKOUT_TIME
        return False, LOCKOUT_TIME
    
    return True, 0

def generate_token() -> str:
    '''Генерация криптографически стойкого токена'''
    return secrets.token_urlsafe(32)

def hash_password(password: str, salt: str = None) -> tuple:
    '''Хеширование пароля с солью'''
    if salt is None:
        salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return password_hash, salt

def validate_password_strength(password: str) -> tuple:
    '''Проверка сложности пароля'''
    if len(password) < 8:
        return False, 'Пароль должен содержать минимум 8 символов'
    if not re.search(r'[A-Z]', password):
        return False, 'Пароль должен содержать хотя бы одну заглавную букву'
    if not re.search(r'[a-z]', password):
        return False, 'Пароль должен содержать хотя бы одну строчную букву'
    if not re.search(r'[0-9]', password):
        return False, 'Пароль должен содержать хотя бы одну цифру'
    return True, ''

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей с защитой от атак'''
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
        client_ip = get_client_ip(event)
        query_params = event.get('queryStringParameters', {}) or {}
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = query_params.get('action') or body.get('action', 'login')
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 't_p3568014_customer_engagement_')
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if action == 'register':
            username = body.get('username', '').strip()
            password = body.get('password', '')
            email = body.get('email', '').strip().lower()
            phone = body.get('phone', '').strip()
            
            if not username or len(username) < 3:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Логин должен содержать минимум 3 символа'}),
                    'isBase64Encoded': False
                }
            
            is_strong, error_msg = validate_password_strength(password)
            if not is_strong:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': error_msg}),
                    'isBase64Encoded': False
                }
            
            if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Некорректный email адрес'}),
                    'isBase64Encoded': False
                }
            
            if not phone or len(phone) < 10:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Некорректный номер телефона'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"SELECT id FROM {schema}.users WHERE username = %s OR email = %s", (username, email))
            existing = cursor.fetchone()
            
            if existing:
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким логином или email уже существует'}),
                    'isBase64Encoded': False
                }
            
            password_hash, salt = hash_password(password)
            
            cursor.execute(
                f"INSERT INTO {schema}.users (username, password_hash, salt, email, phone, created_at, email_verified) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (username, password_hash, salt, email, phone, datetime.now(), False)
            )
            user_id = cursor.fetchone()[0]
            
            verification_token = generate_token()
            expires_at = datetime.now() + timedelta(days=7)
            
            cursor.execute(
                f"INSERT INTO {schema}.email_verification_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, verification_token, expires_at)
            )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user_id': user_id,
                    'username': username,
                    'email': email,
                    'verification_token': verification_token
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            allowed, lockout_time = check_rate_limit(client_ip)
            
            if not allowed:
                return {
                    'statusCode': 429,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': f'Слишком много попыток входа. Повторите через {lockout_time} секунд',
                        'lockout_seconds': lockout_time
                    }),
                    'isBase64Encoded': False
                }
            
            username = body.get('username', '').strip()
            password = body.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите логин и пароль'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                f"SELECT id, username, email, phone, is_active, password_hash, salt, is_admin, email_verified FROM {schema}.users WHERE username = %s",
                (username,)
            )
            user = cursor.fetchone()
            
            if not user:
                time.sleep(0.5)
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
            
            stored_hash = user[5]
            salt = user[6]
            is_admin = user[7] if len(user) > 7 else False
            email_verified = user[8] if len(user) > 8 else True
            password_hash, _ = hash_password(password, salt)
            
            if password_hash != stored_hash:
                time.sleep(0.5)
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
            
            if not email_verified:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email не подтверждён. Проверьте почту и перейдите по ссылке активации.'}),
                    'isBase64Encoded': False
                }
            
            if not user[4]:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аккаунт деактивирован'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token()
            token_expiry = datetime.now() + timedelta(days=7)
            
            cursor.execute(
                f"UPDATE {schema}.users SET last_login = %s, session_token = %s, token_expiry = %s WHERE id = %s",
                (datetime.now(), token, token_expiry, user[0])
            )
            
            cursor.execute(
                f"INSERT INTO {schema}.login_logs (user_id, ip_address, login_time, success) VALUES (%s, %s, %s, %s)",
                (user[0], client_ip, datetime.now(), True)
            )
            
            conn.commit()
            
            if client_ip in RATE_LIMIT:
                del RATE_LIMIT[client_ip]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user[0],
                        'username': user[1],
                        'email': user[2],
                        'phone': user[3],
                        'is_admin': is_admin
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'change_password':
            auth_header = event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '').strip()
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                f"SELECT id, username, salt FROM {schema}.users WHERE session_token = %s AND token_expiry > %s",
                (token, datetime.now())
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недействительная сессия'}),
                    'isBase64Encoded': False
                }
            
            current_password = body.get('current_password', '')
            new_password = body.get('new_password', '')
            
            cursor.execute(
                f"SELECT password_hash FROM {schema}.users WHERE id = %s",
                (user[0],)
            )
            stored_hash = cursor.fetchone()[0]
            
            current_hash, _ = hash_password(current_password, user[2])
            
            if current_hash != stored_hash:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный текущий пароль'}),
                    'isBase64Encoded': False
                }
            
            is_strong, error_msg = validate_password_strength(new_password)
            if not is_strong:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': error_msg}),
                    'isBase64Encoded': False
                }
            
            new_hash, new_salt = hash_password(new_password)
            
            cursor.execute(
                f"UPDATE {schema}.users SET password_hash = %s, salt = %s WHERE id = %s",
                (new_hash, new_salt, user[0])
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Пароль успешно изменен'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_email':
            token = body.get('token', '').strip()
            
            if not token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Токен не указан'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                f"SELECT user_id, expires_at, used FROM {schema}.email_verification_tokens WHERE token = %s",
                (token,)
            )
            verification = cursor.fetchone()
            
            if not verification:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недействительная ссылка активации'}),
                    'isBase64Encoded': False
                }
            
            user_id, expires_at, used = verification
            
            if used:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Ссылка активации уже использована'}),
                    'isBase64Encoded': False
                }
            
            if datetime.now() > expires_at:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Срок действия ссылки активации истёк'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                f"UPDATE {schema}.users SET email_verified = TRUE WHERE id = %s",
                (user_id,)
            )
            
            cursor.execute(
                f"UPDATE {schema}.email_verification_tokens SET used = TRUE WHERE token = %s",
                (token,)
            )
            
            cursor.execute(
                f"SELECT username, email FROM {schema}.users WHERE id = %s",
                (user_id,)
            )
            user_data = cursor.fetchone()
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Email успешно подтверждён! Теперь вы можете войти в систему.',
                    'username': user_data[0],
                    'email': user_data[1]
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'get_all_users':
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
                f"SELECT id, username, is_admin FROM {schema}.users WHERE session_token = %s AND token_expiry > %s",
                (token, datetime.now())
            )
            admin_user = cursor.fetchone()
            
            if not admin_user or not admin_user[2]:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Доступ запрещен. Требуются права администратора'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                f"SELECT id, username, email, phone, created_at, last_login, is_active FROM {schema}.users ORDER BY created_at DESC"
            )
            users = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': [
                        {
                            'user_id': u[0],
                            'username': u[1],
                            'email': u[2],
                            'phone': u[3],
                            'created_at': u[4].isoformat() if u[4] else None,
                            'last_login': u[5].isoformat() if u[5] else None,
                            'is_active': u[6]
                        }
                        for u in users
                    ]
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()