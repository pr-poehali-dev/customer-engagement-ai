#!/usr/bin/env python3
import hashlib
import secrets

def hash_password(password: str, salt: str) -> str:
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return password_hash

# Создаём правильный хеш для AVT63
salt = secrets.token_hex(16)
password = 'Admin123'

hashed = hash_password(password, salt)

print(f'Password: {password}')
print(f'Salt: {salt}')
print(f'Hash: {hashed}')
print()
print('SQL для миграции:')
print(f"UPDATE t_p3568014_customer_engagement_.users SET password_hash = '{hashed}', salt = '{salt}' WHERE username = 'AVT63';")
