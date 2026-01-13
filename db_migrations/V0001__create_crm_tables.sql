-- Таблица клиентов
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hot', 'warm', 'cold')),
    last_contact TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица звонков
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'pending', 'failed')),
    duration VARCHAR(20) NOT NULL,
    result TEXT NOT NULL,
    recording_url TEXT,
    transcript TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица email кампаний
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sent INTEGER NOT NULL DEFAULT 0,
    opened INTEGER NOT NULL DEFAULT 0,
    clicked INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'draft')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- Тестовые данные
INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Иван Петров', 'ivan@mail.ru', '+7 999 123-45-67', 'hot', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'ivan@mail.ru');

INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Мария Сидорова', 'maria@mail.ru', '+7 999 234-56-78', 'warm', NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'maria@mail.ru');

INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Алексей Козлов', 'alex@mail.ru', '+7 999 345-67-89', 'cold', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'alex@mail.ru');

INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Елена Волкова', 'elena@mail.ru', '+7 999 456-78-90', 'hot', NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'elena@mail.ru');

INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Дмитрий Смирнов', 'dmitry@mail.ru', '+7 999 567-89-01', 'warm', NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'dmitry@mail.ru');

INSERT INTO clients (name, email, phone, status, last_contact) 
SELECT 'Анна Кузнецова', 'anna@mail.ru', '+7 999 678-90-12', 'hot', NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'anna@mail.ru');

INSERT INTO calls (client_id, status, duration, result, created_at) 
SELECT 1, 'success', '5:42', 'Запись на встречу', NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 1);

INSERT INTO calls (client_id, status, duration, result, created_at) 
SELECT 2, 'pending', '3:15', 'В процессе', NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 2);

INSERT INTO calls (client_id, status, duration, result, created_at) 
SELECT 3, 'failed', '1:05', 'Не дозвонились', NOW() - INTERVAL '3 hours'
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 3);

INSERT INTO calls (client_id, status, duration, result, created_at) 
SELECT 4, 'success', '7:20', 'Продажа', NOW() - INTERVAL '4 hours'
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 4);

INSERT INTO email_campaigns (name, sent, opened, clicked, status) 
SELECT 'Новогодняя акция', 1250, 850, 320, 'active'
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE name = 'Новогодняя акция');

INSERT INTO email_campaigns (name, sent, opened, clicked, status) 
SELECT 'Приглашение на вебинар', 450, 280, 95, 'completed'
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE name = 'Приглашение на вебинар');

INSERT INTO email_campaigns (name, sent, opened, clicked, status) 
SELECT 'Персональные предложения', 650, 420, 180, 'active'
WHERE NOT EXISTS (SELECT 1 FROM email_campaigns WHERE name = 'Персональные предложения');