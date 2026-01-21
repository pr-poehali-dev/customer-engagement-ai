-- Добавление роли администратора в таблицу users
ALTER TABLE t_p3568014_customer_engagement_.users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Создание индекса для быстрого поиска админов
CREATE INDEX idx_users_is_admin ON t_p3568014_customer_engagement_.users(is_admin) WHERE is_admin = TRUE;