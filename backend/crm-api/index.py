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
        
        path = event.get('queryStringParameters', {}).get('path', 'stats')
        
        if path == 'stats':
            result = get_stats(cursor)
        elif path == 'clients':
            result = get_clients(cursor)
        elif path == 'calls':
            result = get_calls(cursor)
        elif path == 'campaigns':
            result = get_campaigns(cursor)
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
