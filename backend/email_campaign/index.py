import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''API для отправки email рассылок клиентам с уведомлением на zakaz6377@yandex.ru'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            recipients = body.get('recipients', [])
            subject = body.get('subject', '')
            message = body.get('message', '')
            
            if not recipients or not subject or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            smtp_host = os.environ.get('SMTP_HOST')
            smtp_port = int(os.environ.get('SMTP_PORT', 587))
            smtp_username = os.environ.get('SMTP_USERNAME')
            smtp_password = os.environ.get('SMTP_PASSWORD')
            
            if not all([smtp_host, smtp_port, smtp_username, smtp_password]):
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'SMTP not configured'}),
                    'isBase64Encoded': False
                }
            
            results = []
            success_count = 0
            failed_count = 0
            
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.starttls()
            server.login(smtp_username, smtp_password)
            
            for recipient in recipients:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['Subject'] = subject
                    msg['From'] = smtp_username
                    msg['To'] = recipient['email']
                    
                    html = f"<html><body><p>Здравствуйте, {recipient['name']}!</p><div>{message.replace('\n', '<br>')}</div></body></html>"
                    msg.attach(MIMEText(html, 'html'))
                    server.send_message(msg)
                    
                    results.append({'email': recipient['email'], 'name': recipient['name'], 'status': 'sent'})
                    success_count += 1
                except Exception as e:
                    results.append({'email': recipient['email'], 'name': recipient['name'], 'status': 'failed', 'error': str(e)})
                    failed_count += 1
            
            report_msg = MIMEMultipart('alternative')
            report_msg['Subject'] = f'Отчет: {subject}'
            report_msg['From'] = smtp_username
            report_msg['To'] = 'zakaz6377@yandex.ru'
            
            rows = ''.join([f"<tr><td>{r['name']}</td><td>{r['email']}</td><td>{'✅' if r['status'] == 'sent' else '❌'}</td></tr>" for r in results])
            report_html = f"<html><body><h2>Отчет о рассылке</h2><p>Отправлено: {success_count}, Ошибок: {failed_count}</p><table border='1'><tr><th>Имя</th><th>Email</th><th>Статус</th></tr>{rows}</table></body></html>"
            
            report_msg.attach(MIMEText(report_html, 'html'))
            server.send_message(report_msg)
            server.quit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'sent': success_count, 'failed': failed_count, 'results': results}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
