import json
import os
import hashlib
import re
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'login')
        
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
            
            if not password or len(password) < 6:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пароль должен содержать минимум 6 символов'}),
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
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                f"INSERT INTO {schema}.users (username, password_hash, email, phone, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (username, password_hash, email, phone, datetime.now())
            )
            user_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user_id': user_id,
                    'username': username,
                    'email': email
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            username = body.get('username', '').strip()
            password = body.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите логин и пароль'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute(
                f"SELECT id, username, email, phone, is_active FROM {schema}.users WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
            
            if not user[4]:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аккаунт деактивирован'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"UPDATE {schema}.users SET last_login = %s WHERE id = %s", (datetime.now(), user[0]))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user_id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'phone': user[3]
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
