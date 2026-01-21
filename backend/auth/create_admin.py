import os
import hashlib
import secrets
import psycopg2
from datetime import datetime

def hash_password(password: str, salt: str = None) -> tuple:
    if salt is None:
        salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return password_hash, salt

dsn = os.environ.get('DATABASE_URL')
schema = 't_p3568014_customer_engagement_'

admin_username = 'AVT63'
admin_password = 'AVT2025+'
admin_email = 'admin@avt.system'
admin_phone = '+70000000000'

password_hash, salt = hash_password(admin_password)

conn = psycopg2.connect(dsn)
cursor = conn.cursor()

cursor.execute(f"SELECT id FROM {schema}.users WHERE username = %s", (admin_username,))
existing = cursor.fetchone()

if existing:
    cursor.execute(
        f"UPDATE {schema}.users SET password_hash = %s, salt = %s, is_admin = TRUE, email = %s, phone = %s WHERE username = %s",
        (password_hash, salt, admin_email, admin_phone, admin_username)
    )
    print(f"Admin user '{admin_username}' updated successfully")
else:
    cursor.execute(
        f"INSERT INTO {schema}.users (username, password_hash, salt, email, phone, is_admin, created_at) VALUES (%s, %s, %s, %s, %s, TRUE, %s)",
        (admin_username, password_hash, salt, admin_email, admin_phone, datetime.now())
    )
    print(f"Admin user '{admin_username}' created successfully")

conn.commit()
cursor.close()
conn.close()
