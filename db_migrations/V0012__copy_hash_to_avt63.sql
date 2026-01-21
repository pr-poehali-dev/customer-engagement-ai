-- Копируем проверенный хеш от secureuser99 для AVT63
-- Пароль: SecurePass123 (тот же что у secureuser99)
-- Это временный пароль, который можно сменить в настройках
UPDATE t_p3568014_customer_engagement_.users 
SET 
  password_hash = 'b5aa300990241fffccf25cb7e35e0f27b1365fb041e6062461ed7dd0123b2c08',
  salt = '491f5272b2bce385afb517426ff1b495'
WHERE username = 'AVT63';