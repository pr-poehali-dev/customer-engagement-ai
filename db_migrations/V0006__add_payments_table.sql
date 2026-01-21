-- Создание таблицы платежей
CREATE TABLE IF NOT EXISTS t_p3568014_customer_engagement_.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p3568014_customer_engagement_.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_method VARCHAR(50) DEFAULT 'SBP',
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    qr_code_url TEXT,
    payment_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    description TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_payments_user_id ON t_p3568014_customer_engagement_.payments(user_id);
CREATE INDEX idx_payments_status ON t_p3568014_customer_engagement_.payments(status);
CREATE INDEX idx_payments_payment_id ON t_p3568014_customer_engagement_.payments(payment_id);