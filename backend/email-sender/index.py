import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''API для отправки email уведомлений и подтверждений'''
    method = event.get('httpMethod', 'GET')
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'send')
        
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not all([smtp_host, smtp_user, smtp_password]):
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'SMTP настройки не сконфигурированы'}),
                'isBase64Encoded': False
            }
        
        if action == 'send_verification':
            to_email = body.get('email')
            username = body.get('username')
            password = body.get('password')
            
            if not all([to_email, username, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не все параметры указаны'}),
                    'isBase64Encoded': False
                }
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Добро пожаловать в AVT! Подтверждение регистрации'
            msg['From'] = smtp_user
            msg['To'] = to_email
            
            html_content = f"""
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1; margin: 0;">AVT Platform</h1>
                    <p style="color: #64748b; margin-top: 10px;">Платформа автоматизации работы с клиентами</p>
                  </div>
                  
                  <h2 style="color: #1e293b;">Добро пожаловать, {username}!</h2>
                  
                  <p style="color: #475569; line-height: 1.6;">
                    Спасибо за регистрацию в AVT Platform. Ваш аккаунт успешно создан!
                  </p>
                  
                  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e293b; margin-top: 0;">Ваши данные для входа:</h3>
                    <p style="margin: 10px 0;"><strong>Логин:</strong> {username}</p>
                    <p style="margin: 10px 0;"><strong>Временный пароль:</strong> <code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">{password}</code></p>
                  </div>
                  
                  <p style="color: #ef4444; line-height: 1.6;">
                    ⚠️ <strong>Важно:</strong> Рекомендуем сменить пароль после первого входа в настройках профиля.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://preview--customer-engagement-ai.poehali.dev/" 
                       style="display: inline-block; background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Войти в систему
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; color: #94a3b8; font-size: 12px; text-align: center;">
                    <p>Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
                    <p>© 2026 AVT Platform. Все права защищены.</p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            text_content = f"""
Добро пожаловать в AVT Platform, {username}!

Спасибо за регистрацию. Ваш аккаунт успешно создан.

Данные для входа:
Логин: {username}
Временный пароль: {password}

⚠️ Рекомендуем сменить пароль после первого входа в настройках профиля.

Войти: https://preview--customer-engagement-ai.poehali.dev/

---
© 2026 AVT Platform
            """
            
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            part2 = MIMEText(html_content, 'html', 'utf-8')
            
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Email успешно отправлен'
                }),
                'isBase64Encoded': False
            }
        
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
            'body': json.dumps({'error': f'Ошибка отправки email: {str(e)}'}),
            'isBase64Encoded': False
        }
