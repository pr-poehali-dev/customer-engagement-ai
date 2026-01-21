-- Добавление поля email_verified в таблицу users
ALTER TABLE t_p3568014_customer_engagement_.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Создание таблицы для токенов верификации email
CREATE TABLE IF NOT EXISTS t_p3568014_customer_engagement_.email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_verification_token ON t_p3568014_customer_engagement_.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON t_p3568014_customer_engagement_.email_verification_tokens(user_id);

-- Устанавливаем email_verified = TRUE для существующих пользователей
UPDATE t_p3568014_customer_engagement_.users 
SET email_verified = TRUE 
WHERE email_verified IS NULL OR email_verified = FALSE;