CREATE TABLE IF NOT EXISTS scenarios (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scenarios_status ON scenarios(status);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);
