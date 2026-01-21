ALTER TABLE t_p3568014_customer_engagement_.users
ADD COLUMN IF NOT EXISTS salt VARCHAR(32),
ADD COLUMN IF NOT EXISTS session_token VARCHAR(64),
ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

CREATE TABLE IF NOT EXISTS t_p3568014_customer_engagement_.login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p3568014_customer_engagement_.users(id),
    ip_address VARCHAR(45),
    login_time TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON t_p3568014_customer_engagement_.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip ON t_p3568014_customer_engagement_.login_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON t_p3568014_customer_engagement_.users(session_token);