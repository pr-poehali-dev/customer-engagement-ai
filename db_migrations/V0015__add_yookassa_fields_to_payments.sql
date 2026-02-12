ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_system VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES subscriptions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);