import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import urllib.request
import urllib.parse
import uuid
import hashlib
import hmac


def get_db_connection():
    '''Создает подключение к PostgreSQL'''
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL environment variable is not set')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)


def handler(event: dict, context) -> dict:
    '''API для обработки платежей через ЮKassa: создание платежей, обработка вебхуков, управление подписками'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        params = event.get('queryStringParameters', {}) or {}
        path = params.get('path', 'plans')
        
        if method == 'GET':
            if path == 'plans':
                result = get_plans(cursor)
            elif path == 'subscription':
                user_id = params.get('user_id')
                result = get_user_subscription(cursor, user_id)
            elif path == 'payment_history':
                user_id = params.get('user_id')
                result = get_payment_history(cursor, user_id)
            else:
                result = {'error': 'Unknown path'}
        
        elif method == 'POST':
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if body_str else {}
            
            if path == 'create_payment':
                result = create_payment(cursor, conn, body)
            elif path == 'yookassa_webhook':
                result = handle_yookassa_webhook(cursor, conn, body, event.get('headers', {}))
            elif path == 'cancel_subscription':
                result = cancel_subscription(cursor, conn, body)
            elif path == 'check_access':
                result = check_feature_access(cursor, body)
            elif path == 'check_expiring':
                result = check_expiring_subscriptions(cursor, conn)
            elif path == 'renew_subscription':
                result = renew_subscription(cursor, conn, body)
            elif path == 'update_auto_renew':
                result = update_auto_renew(cursor, conn, body)
            else:
                result = {'error': 'Unknown path'}
        
        else:
            result = {'error': 'Method not allowed'}
        
        cursor.close()
        conn.close()
        
        return success_response(result)
    
    except Exception as e:
        return error_response(str(e))


def get_plans(cursor):
    '''Получает список доступных тарифных планов'''
    
    cursor.execute("""
        SELECT 
            plan_type, 
            max_clients, 
            max_calls_per_month, 
            max_email_campaigns,
            ai_analysis_enabled,
            ai_suggestions_enabled,
            priority_support,
            price_monthly,
            price_yearly
        FROM plan_limits
        ORDER BY price_monthly ASC
    """)
    
    plans = cursor.fetchall()
    
    return {
        'plans': [dict(p) for p in plans]
    }


def get_user_subscription(cursor, user_id):
    '''Получает текущую подписку пользователя'''
    
    if not user_id:
        return {'error': 'user_id is required'}
    
    cursor.execute("""
        SELECT 
            s.id,
            s.plan_type,
            s.status,
            s.start_date,
            s.end_date,
            s.auto_renew,
            pl.max_clients,
            pl.max_calls_per_month,
            pl.max_email_campaigns,
            pl.ai_analysis_enabled,
            pl.ai_suggestions_enabled,
            pl.priority_support,
            pl.price_monthly,
            pl.price_yearly
        FROM subscriptions s
        JOIN plan_limits pl ON s.plan_type = pl.plan_type
        WHERE s.user_id = %s AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
    """, (user_id,))
    
    subscription = cursor.fetchone()
    
    if not subscription:
        return {
            'subscription': None,
            'message': 'No active subscription'
        }
    
    sub_dict = dict(subscription)
    if sub_dict.get('start_date'):
        sub_dict['start_date'] = sub_dict['start_date'].isoformat()
    if sub_dict.get('end_date'):
        sub_dict['end_date'] = sub_dict['end_date'].isoformat()
    
    return {
        'subscription': sub_dict
    }


def get_payment_history(cursor, user_id):
    '''Получает историю платежей пользователя'''
    
    if not user_id:
        return {'error': 'user_id is required'}
    
    cursor.execute("""
        SELECT 
            p.id,
            p.amount,
            p.currency,
            p.payment_method,
            p.status,
            p.created_at,
            s.plan_type
        FROM payments p
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        WHERE p.user_id = %s
        ORDER BY p.created_at DESC
        LIMIT 50
    """, (user_id,))
    
    payments = cursor.fetchall()
    
    for payment in payments:
        if payment['created_at']:
            payment['created_at'] = payment['created_at'].isoformat()
    
    return {
        'payments': [dict(p) for p in payments]
    }


def create_payment(cursor, conn, body):
    '''Создает платеж через ЮKassa'''
    
    user_id = body.get('user_id')
    plan_type = body.get('plan_type')
    billing_period = body.get('billing_period', 'monthly')
    
    if not all([user_id, plan_type]):
        return {'error': 'user_id and plan_type are required'}
    
    cursor.execute("""
        SELECT price_monthly, price_yearly
        FROM plan_limits
        WHERE plan_type = %s
    """, (plan_type,))
    
    plan = cursor.fetchone()
    if not plan:
        return {'error': 'Plan not found'}
    
    amount = float(plan['price_yearly']) if billing_period == 'yearly' else float(plan['price_monthly'])
    
    yookassa_shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    yookassa_secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    
    if not yookassa_shop_id or not yookassa_secret_key:
        cursor.execute("""
            INSERT INTO payments (user_id, amount, currency, status, metadata)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, amount, 'RUB', 'pending', json.dumps({
            'plan_type': plan_type,
            'billing_period': billing_period,
            'demo_mode': True
        })))
        
        payment_id = cursor.fetchone()['id']
        conn.commit()
        
        return {
            'success': True,
            'payment_id': payment_id,
            'demo_mode': True,
            'message': 'Для реальных платежей настройте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY'
        }
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{amount:.2f}',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': body.get('return_url', 'https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=payment')
        },
        'capture': True,
        'description': f'Подписка {plan_type} ({billing_period})',
        'metadata': {
            'user_id': str(user_id),
            'plan_type': plan_type,
            'billing_period': billing_period
        }
    }
    
    try:
        url = 'https://api.yookassa.ru/v3/payments'
        
        data = json.dumps(payment_data, ensure_ascii=False).encode('utf-8')
        
        auth_string = f'{yookassa_shop_id}:{yookassa_secret_key}'
        auth_bytes = auth_string.encode('utf-8')
        import base64
        auth_header = 'Basic ' + base64.b64encode(auth_bytes).decode('utf-8')
        
        headers = {
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotence_key,
            'Authorization': auth_header
        }
        
        request = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            cursor.execute("""
                INSERT INTO payments (
                    user_id, amount, currency, payment_method, 
                    payment_system, external_payment_id, status, metadata
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id, amount, 'RUB', result.get('payment_method', {}).get('type'),
                'yookassa', result.get('id'), result.get('status'), 
                json.dumps({
                    'plan_type': plan_type,
                    'billing_period': billing_period,
                    'yookassa_response': result
                })
            ))
            
            payment_id = cursor.fetchone()['id']
            conn.commit()
            
            confirmation_url = result.get('confirmation', {}).get('confirmation_url')
            
            return {
                'success': True,
                'payment_id': payment_id,
                'external_payment_id': result.get('id'),
                'confirmation_url': confirmation_url,
                'status': result.get('status')
            }
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'success': False,
            'error': f'YooKassa error: {error_body}'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def handle_yookassa_webhook(cursor, conn, body, headers):
    '''Обрабатывает вебхук от ЮKassa о статусе платежа'''
    
    event_type = body.get('event')
    payment_object = body.get('object', {})
    
    if event_type != 'payment.succeeded':
        return {'success': True, 'message': 'Event ignored'}
    
    external_payment_id = payment_object.get('id')
    payment_status = payment_object.get('status')
    
    cursor.execute("""
        SELECT id, user_id, metadata
        FROM payments
        WHERE external_payment_id = %s
    """, (external_payment_id,))
    
    payment_record = cursor.fetchone()
    
    if not payment_record:
        return {'success': False, 'error': 'Payment not found'}
    
    cursor.execute("""
        UPDATE payments
        SET status = %s, updated_at = NOW()
        WHERE id = %s
    """, (payment_status, payment_record['id']))
    
    if payment_status == 'succeeded':
        metadata = payment_record['metadata']
        plan_type = metadata.get('plan_type')
        billing_period = metadata.get('billing_period', 'monthly')
        user_id = payment_record['user_id']
        
        cursor.execute("""
            UPDATE subscriptions
            SET status = 'inactive'
            WHERE user_id = %s AND status = 'active'
        """, (user_id,))
        
        end_date = datetime.now() + timedelta(days=365 if billing_period == 'yearly' else 30)
        
        cursor.execute("""
            INSERT INTO subscriptions (
                user_id, plan_type, status, start_date, end_date, auto_renew
            )
            VALUES (%s, %s, %s, NOW(), %s, TRUE)
            RETURNING id
        """, (user_id, plan_type, 'active', end_date))
        
        subscription_id = cursor.fetchone()['id']
        
        cursor.execute("""
            UPDATE payments
            SET subscription_id = %s
            WHERE id = %s
        """, (subscription_id, payment_record['id']))
    
    conn.commit()
    
    return {
        'success': True,
        'message': 'Webhook processed',
        'payment_status': payment_status
    }


def cancel_subscription(cursor, conn, body):
    '''Отменяет подписку пользователя'''
    
    user_id = body.get('user_id')
    
    if not user_id:
        return {'error': 'user_id is required'}
    
    cursor.execute("""
        UPDATE subscriptions
        SET status = 'cancelled', auto_renew = FALSE, updated_at = NOW()
        WHERE user_id = %s AND status = 'active'
    """, (user_id,))
    
    conn.commit()
    
    return {
        'success': True,
        'message': 'Subscription cancelled'
    }


def check_feature_access(cursor, body):
    '''Проверяет доступ пользователя к функции на основе тарифного плана'''
    
    user_id = body.get('user_id')
    feature = body.get('feature')
    
    if not all([user_id, feature]):
        return {'error': 'user_id and feature are required'}
    
    cursor.execute("""
        SELECT 
            s.plan_type,
            pl.ai_analysis_enabled,
            pl.ai_suggestions_enabled,
            pl.max_clients,
            pl.max_calls_per_month,
            pl.max_email_campaigns
        FROM subscriptions s
        JOIN plan_limits pl ON s.plan_type = pl.plan_type
        WHERE s.user_id = %s AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
    """, (user_id,))
    
    subscription = cursor.fetchone()
    
    if not subscription:
        return {
            'access': False,
            'reason': 'No active subscription',
            'upgrade_required': True
        }
    
    feature_map = {
        'ai_analysis': 'ai_analysis_enabled',
        'ai_suggestions': 'ai_suggestions_enabled'
    }
    
    if feature in feature_map:
        has_access = subscription.get(feature_map[feature], False)
        return {
            'access': has_access,
            'plan_type': subscription['plan_type'],
            'upgrade_required': not has_access
        }
    
    return {
        'access': True,
        'plan_type': subscription['plan_type']
    }


def success_response(data):
    '''Формирует успешный ответ'''
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def check_expiring_subscriptions(cursor, conn):
    '''Проверяет подписки, истекающие в течение 7 дней, и отправляет уведомления'''
    
    cursor.execute("""
        SELECT 
            s.id,
            s.user_id,
            s.plan_type,
            s.end_date,
            s.auto_renew,
            u.email,
            u.full_name
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE s.status = 'active' 
        AND s.end_date <= NOW() + INTERVAL '7 days'
        AND s.end_date > NOW()
    """)
    
    expiring = cursor.fetchall()
    notifications_sent = 0
    
    for sub in expiring:
        days_left = (sub['end_date'] - datetime.now()).days
        
        send_expiration_notification(
            email=sub['email'],
            name=sub['full_name'] or 'Пользователь',
            plan_type=sub['plan_type'],
            days_left=days_left,
            auto_renew=sub['auto_renew']
        )
        notifications_sent += 1
    
    cursor.execute("""
        UPDATE subscriptions
        SET status = 'expired'
        WHERE status = 'active' AND end_date < NOW()
    """)
    expired_count = cursor.rowcount
    conn.commit()
    
    return {
        'success': True,
        'expiring_count': len(expiring),
        'notifications_sent': notifications_sent,
        'expired_count': expired_count
    }


def renew_subscription(cursor, conn, body):
    '''Автоматически продлевает подписку пользователя'''
    
    user_id = body.get('user_id')
    
    if not user_id:
        return {'error': 'user_id is required'}
    
    cursor.execute("""
        SELECT 
            s.*,
            pl.price_monthly,
            pl.price_yearly
        FROM subscriptions s
        JOIN plan_limits pl ON s.plan_type = pl.plan_type
        WHERE s.user_id = %s 
        AND s.status = 'active'
        AND s.auto_renew = TRUE
        AND s.end_date <= NOW() + INTERVAL '3 days'
        ORDER BY s.created_at DESC
        LIMIT 1
    """, (user_id,))
    
    subscription = cursor.fetchone()
    
    if not subscription:
        return {
            'success': False,
            'message': 'No subscription found for auto-renewal'
        }
    
    billing_period = 'yearly' if (subscription['end_date'] - subscription['start_date']).days > 200 else 'monthly'
    amount = float(subscription['price_yearly']) if billing_period == 'yearly' else float(subscription['price_monthly'])
    
    yookassa_shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    yookassa_secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    
    if not yookassa_shop_id or not yookassa_secret_key:
        return {
            'success': False,
            'message': 'YooKassa credentials not configured'
        }
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{amount:.2f}',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': 'https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=payment'
        },
        'capture': True,
        'description': f'Автопродление подписки {subscription["plan_type"]} ({billing_period})',
        'metadata': {
            'user_id': str(user_id),
            'plan_type': subscription['plan_type'],
            'billing_period': billing_period,
            'auto_renewal': 'true'
        }
    }
    
    try:
        url = 'https://api.yookassa.ru/v3/payments'
        data = json.dumps(payment_data, ensure_ascii=False).encode('utf-8')
        
        auth_string = f'{yookassa_shop_id}:{yookassa_secret_key}'
        import base64
        auth_header = 'Basic ' + base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
        
        headers = {
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotence_key,
            'Authorization': auth_header
        }
        
        request = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            cursor.execute("""
                INSERT INTO payments (
                    user_id, amount, currency, payment_method, 
                    payment_system, external_payment_id, status, metadata
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id, amount, 'RUB', result.get('payment_method', {}).get('type'),
                'yookassa', result.get('id'), result.get('status'), 
                json.dumps({
                    'plan_type': subscription['plan_type'],
                    'billing_period': billing_period,
                    'auto_renewal': True,
                    'yookassa_response': result
                })
            ))
            
            conn.commit()
            
            return {
                'success': True,
                'payment_id': result.get('id'),
                'confirmation_url': result.get('confirmation', {}).get('confirmation_url'),
                'message': 'Auto-renewal payment created'
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def update_auto_renew(cursor, conn, body):
    '''Обновляет настройку автопродления подписки'''
    
    user_id = body.get('user_id')
    auto_renew = body.get('auto_renew', True)
    
    if not user_id:
        return {'error': 'user_id is required'}
    
    cursor.execute("""
        UPDATE subscriptions
        SET auto_renew = %s, updated_at = NOW()
        WHERE user_id = %s AND status = 'active'
    """, (auto_renew, user_id))
    
    conn.commit()
    
    return {
        'success': True,
        'message': f'Auto-renew {"enabled" if auto_renew else "disabled"}',
        'auto_renew': auto_renew
    }


def send_expiration_notification(email: str, name: str, plan_type: str, days_left: int, auto_renew: bool):
    '''Отправляет email-уведомление об истечении подписки'''
    
    try:
        email_sender_url = os.environ.get('EMAIL_SENDER_URL')
        if not email_sender_url:
            return False
        
        plan_names = {
            'starter': 'Стартовый',
            'professional': 'Профессиональный',
            'enterprise': 'Корпоративный'
        }
        
        plan_name = plan_names.get(plan_type, plan_type)
        
        if auto_renew:
            subject = f'💳 Автопродление подписки AVT - {plan_name}'
            message = f'''Здравствуйте, {name}!

Ваша подписка на тариф "{plan_name}" истекает через {days_left} дн.

✅ Автопродление включено
Ваша подписка будет автоматически продлена. Средства будут списаны с карты, привязанной к вашему аккаунту.

Если вы хотите отменить автопродление, перейдите в раздел "Оплата" в личном кабинете.

🔗 Управление подпиской: https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=payment

С уважением,
Команда AVT Platform'''
        else:
            subject = f'⚠️ Подписка AVT истекает через {days_left} дн.'
            message = f'''Здравствуйте, {name}!

Ваша подписка на тариф "{plan_name}" истекает через {days_left} дн.

❌ Автопродление отключено
Для продления доступа к функциям вашего тарифа необходимо оформить новую подписку.

После истечения срока действия подписки:
• Будет ограничен доступ к ИИ-функциям
• Сохранится доступ к базовым функциям
• Все ваши данные останутся в безопасности

🔗 Продлить подписку: https://preview--customer-engagement-ai.poehali.dev/dashboard?tab=payment

С уважением,
Команда AVT Platform'''
        
        email_payload = {
            'action': 'send_subscription_notification',
            'to_email': email,
            'subject': subject,
            'message': message,
            'plan_type': plan_type,
            'days_left': days_left,
            'auto_renew': auto_renew,
            'name': name
        }
        
        data = json.dumps(email_payload, ensure_ascii=False).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        
        request = urllib.request.Request(
            email_sender_url,
            data=data,
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(request, timeout=10) as response:
            return True
    
    except Exception as e:
        print(f'Email notification error: {str(e)}')
        return False


def error_response(error_message):
    '''Формирует ответ с ошибкой'''
    return {
        'statusCode': 500,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': error_message}, ensure_ascii=False),
        'isBase64Encoded': False
    }