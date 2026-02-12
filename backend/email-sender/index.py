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
            verification_token = body.get('verification_token')
            
            if not all([to_email, username, password, verification_token]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не все параметры указаны'}),
                    'isBase64Encoded': False
                }
            
            verification_url = f'https://preview--customer-engagement-ai.poehali.dev/verify-email?token={verification_token}'
            
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
                    Спасибо за регистрацию в AVT Platform. Ваш аккаунт почти готов!
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #92400e; margin-top: 0;">⚠️ Подтвердите email</h3>
                    <p style="color: #78350f; margin: 0;">Для завершения регистрации необходимо подтвердить ваш email адрес.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="display: inline-block; background: linear-gradient(to right, #10b981, #059669); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      ✔️ Подтвердить email
                    </a>
                  </div>
                  
                  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e293b; margin-top: 0;">Ваши данные для входа:</h3>
                    <p style="margin: 10px 0;"><strong>Логин:</strong> {username}</p>
                    <p style="margin: 10px 0;"><strong>Пароль:</strong> <code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">{password}</code></p>
                  </div>
                  
                  <p style="color: #ef4444; line-height: 1.6; font-size: 13px;">
                    🔒 Рекомендуем сменить пароль после первого входа.
                  </p>
                  
                  <p style="color: #64748b; line-height: 1.6; font-size: 12px; margin-top: 20px;">
                    Ссылка действует 7 дней. Если кнопка не работает, скопируйте ссылку:<br>
                    <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; word-break: break-all;">{verification_url}</code>
                  </p>
                  
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

Спасибо за регистрацию. Ваш аккаунт почти готов!

⚠️ ПОДТВЕРДИТЕ EMAIL
Для завершения регистрации перейдите по ссылке:
{verification_url}

Данные для входа:
Логин: {username}
Пароль: {password}

🔒 Рекомендуем сменить пароль после первого входа.

Ссылка действует 7 дней.

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
        
        elif action == 'send_call_summary':
            to_email = body.get('to_email')
            client_name = body.get('client_name')
            company = body.get('company', '')
            phone = body.get('phone', '')
            duration = body.get('duration', '0:00')
            status = body.get('status', 'unknown')
            result = body.get('result', '')
            summary = body.get('summary', '')
            full_analysis = body.get('full_analysis', '')
            
            if not all([to_email, client_name]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не все параметры указаны'}),
                    'isBase64Encoded': False
                }
            
            status_emoji = '✅' if status == 'success' else '⏳' if status == 'pending' else '❌'
            status_text = 'Успешный' if status == 'success' else 'В процессе' if status == 'pending' else 'Неудачный'
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'🤖 ИИ-анализ звонка: {client_name}'
            msg['From'] = smtp_user
            msg['To'] = to_email
            
            html_content = f"""
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 700px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">🤖 ИИ-Анализ звонка</h1>
                    <p style="color: #64748b; margin-top: 10px;">Автоматический отчет YandexGPT агента</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin-bottom: 25px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 24px;">👤 {client_name}</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                      <div>
                        <strong>🏢 Компания:</strong> {company or 'Не указано'}
                      </div>
                      <div>
                        <strong>📞 Телефон:</strong> {phone}
                      </div>
                      <div>
                        <strong>⏱️ Длительность:</strong> {duration}
                      </div>
                      <div>
                        <strong>{status_emoji} Статус:</strong> {status_text}
                      </div>
                    </div>
                  </div>
                  
                  <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #1e293b; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                      📋 Результат звонка
                    </h3>
                    <p style="color: #475569; margin: 0; font-size: 15px;">{result}</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h3 style="color: white; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                      ✨ Краткое резюме ИИ
                    </h3>
                    <div style="background-color: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; color: #1e293b; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">{summary}</div>
                  </div>
                  
                  <div style="background-color: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #92400e; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                      🎯 Полный анализ агента
                    </h3>
                    <div style="color: #78350f; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">{full_analysis}</div>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=calls" 
                       style="display: inline-block; background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🔗 Открыть CRM систему
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; color: #94a3b8; font-size: 12px; text-align: center;">
                    <p>Это письмо было создано автоматически YandexGPT агентом.</p>
                    <p>📧 Для вопросов и настроек пишите на zakaz6377@yandex.ru</p>
                    <p>© 2026 AVT Platform. Все права защищены.</p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            text_content = f"""
🤖 ИИ-АНАЛИЗ ЗВОНКА

👤 Клиент: {client_name}
🏢 Компания: {company or 'Не указано'}
📞 Телефон: {phone}
⏱️ Длительность: {duration}
{status_emoji} Статус: {status_text}

📋 Результат: {result}

✨ КРАТКОЕ РЕЗЮМЕ ИИ:
{summary}

🎯 ПОЛНЫЙ АНАЛИЗ:
{full_analysis}

---
🔗 Открыть CRM: https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=calls

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
                    'message': f'Email с анализом звонка отправлен на {to_email}'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'send_subscription_notification':
            to_email = body.get('to_email')
            subject = body.get('subject')
            message = body.get('message')
            name = body.get('name', 'Пользователь')
            plan_type = body.get('plan_type', '')
            days_left = body.get('days_left', 0)
            auto_renew = body.get('auto_renew', False)
            
            if not all([to_email, subject, message]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не все параметры указаны'}),
                    'isBase64Encoded': False
                }
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = smtp_user
            msg['To'] = to_email
            
            plan_names = {
                'starter': 'Стартовый',
                'professional': 'Профессиональный',
                'enterprise': 'Корпоративный'
            }
            plan_name = plan_names.get(plan_type, plan_type)
            
            if auto_renew:
                icon = '💳'
                color = 'green'
                status_text = 'Автопродление включено'
                status_color = '#10b981'
            else:
                icon = '⏰'
                color = 'orange'
                status_text = 'Требуется продление'
                status_color = '#f59e0b'
            
            html_content = f"""
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">{icon}</div>
                    <h1 style="color: #1e293b; margin: 0;">AVT Platform</h1>
                    <p style="color: #64748b; margin-top: 10px;">Уведомление о подписке</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, {status_color} 0%, {status_color}dd 100%); padding: 20px; border-radius: 10px; color: white; margin-bottom: 25px; text-align: center;">
                    <h2 style="margin: 0 0 10px 0; font-size: 22px;">Здравствуйте, {name}!</h2>
                    <p style="margin: 0; font-size: 16px;">Ваша подписка на тариф <strong>"{plan_name}"</strong></p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">истекает через {days_left} дн.</p>
                  </div>
                  
                  <div style="background-color: #f8fafc; border-left: 4px solid {status_color}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #1e293b; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                      {status_text}
                    </h3>
                    <div style="color: #475569; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">{message}</div>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=payment" 
                       style="display: inline-block; background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🔗 Управление подпиской
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
            
            text_content = message
            
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
                    'message': f'Уведомление о подписке отправлено на {to_email}'
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