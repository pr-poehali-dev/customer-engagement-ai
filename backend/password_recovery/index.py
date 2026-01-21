import json
import os
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''API для восстановления пароля через email с кодом подтверждения'''
    
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
            action = body.get('action', 'send_code')
            email = body.get('email', '')
            
            admin_email = 'zakaz6377@yandex.ru'
            
            if action == 'send_code':
                if email != admin_email:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email администратора'}),
                        'isBase64Encoded': False
                    }
                
                recovery_code = ''.join(random.choices(string.digits, k=6))
                
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
                
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
                server.starttls()
                server.login(smtp_username, smtp_password)
                
                msg = MIMEMultipart('alternative')
                msg['Subject'] = 'Код восстановления пароля AVT'
                msg['From'] = smtp_username
                msg['To'] = email
                
                html = f"""
                <html>
                <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4f46e5; margin: 0;">AVT</h1>
                            <p style="color: #666; margin-top: 5px;">AI Customer Engagement Platform</p>
                        </div>
                        
                        <h2 style="color: #333; margin-bottom: 20px;">Восстановление пароля</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Вы запросили восстановление пароля для входа в систему AVT.
                        </p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Ваш код восстановления:</p>
                            <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px;">
                                {recovery_code}
                            </div>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                            Введите этот код на странице восстановления пароля.
                        </p>
                        
                        <p style="color: #ef4444; font-size: 14px; line-height: 1.6;">
                            ⚠️ Код действителен в течение 15 минут. Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            © 2025 AVT. Все права защищены.
                        </p>
                    </div>
                </body>
                </html>
                """
                
                msg.attach(MIMEText(html, 'html'))
                server.send_message(msg)
                server.quit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'code': recovery_code,
                        'message': 'Код отправлен на email'
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify_code':
                code = body.get('code', '')
                sent_code = body.get('sent_code', '')
                
                if code == sent_code:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'verified': True}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный код'}),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
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
