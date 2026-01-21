-- Создание таблицы пользователей системы
CREATE TABLE IF NOT EXISTS t_p3568014_customer_engagement_.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Индексы для быстрого поиска
CREATE INDEX idx_users_username ON t_p3568014_customer_engagement_.users(username);
CREATE INDEX idx_users_email ON t_p3568014_customer_engagement_.users(email);
CREATE INDEX idx_users_phone ON t_p3568014_customer_engagement_.users(phone);
