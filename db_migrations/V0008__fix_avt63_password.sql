-- Исправление пароля для пользователя AVT63
-- Пароль: AVT63pass1 (соответствует требованиям: 8+ символов, заглавные, строчные, цифры)
UPDATE t_p3568014_customer_engagement_.users 
SET 
  password_hash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  salt = 'avt63secure2026'
WHERE username = 'AVT63';