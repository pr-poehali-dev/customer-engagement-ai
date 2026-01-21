import hashlib

def hash_password(password: str, salt: str) -> str:
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return password_hash

if __name__ == '__main__':
    salt = 'avt63secure2026'
    password = 'Avt63pass1'
    
    hashed = hash_password(password, salt)
    print(f'Password: {password}')
    print(f'Salt: {salt}')
    print(f'Hash: {hashed}')
