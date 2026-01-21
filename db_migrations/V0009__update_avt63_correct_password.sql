-- Обновление пароля для AVT63 на правильный хеш
-- Пароль: Avt63pass1 (8 символов, заглавные, строчные, цифры)
-- Соль: avt63secure2026
UPDATE t_p3568014_customer_engagement_.users 
SET 
  password_hash = 'b5a2c96250612366ea272ffac6d9744aaf4b45aacd96aa7cfcb931ee3b558259',
  salt = 'avt63secure2026'
WHERE username = 'AVT63';