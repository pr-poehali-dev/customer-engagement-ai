-- Устанавливаем правильный пароль для AVT63: Admin123
-- Используем соль: avt63_final_salt
-- Хеш создан через pbkdf2_hmac SHA256 с 100000 итераций
UPDATE t_p3568014_customer_engagement_.users 
SET 
  password_hash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  salt = 'avt63_final_salt'
WHERE username = 'AVT63';