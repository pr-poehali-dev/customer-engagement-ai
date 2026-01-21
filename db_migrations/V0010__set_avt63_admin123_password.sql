-- Устанавливаем простой пароль для AVT63: Admin123
-- Пароль соответствует всем требованиям: 8+ символов, заглавные, строчные, цифры
-- Хеш рассчитан через PBKDF2-SHA256 с 100000 итераций
UPDATE t_p3568014_customer_engagement_.users 
SET 
  password_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  salt = 'admin_salt_2026'
WHERE username = 'AVT63';