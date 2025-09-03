-- Initialize Treasury Management System Database
-- This script runs when the PostgreSQL container starts

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE treasury_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'treasury_db')\gexec

-- Connect to the treasury_db database
\c treasury_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create treasuries table
CREATE TABLE IF NOT EXISTS treasuries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('main', 'sub')),
    parent_id INTEGER REFERENCES treasuries(id),
    balance DECIMAL(15,2) DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    treasury_id INTEGER NOT NULL REFERENCES treasuries(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(50),
    from_treasury_id INTEGER REFERENCES treasuries(id),
    to_treasury_id INTEGER REFERENCES treasuries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create treasury_permissions table
CREATE TABLE IF NOT EXISTS treasury_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    treasury_id INTEGER NOT NULL REFERENCES treasuries(id),
    can_view BOOLEAN DEFAULT false,
    can_deposit BOOLEAN DEFAULT false,
    can_withdraw BOOLEAN DEFAULT false,
    can_transfer BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, treasury_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_treasury_id ON transactions(treasury_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Insert default main treasury
INSERT INTO treasuries (name, type, balance, description) 
VALUES ('الخزينة الرئيسية', 'main', 100000.00, 'الخزينة الرئيسية للنظام')
ON CONFLICT DO NOTHING;

-- Insert default sub treasuries
INSERT INTO treasuries (name, type, balance, description) VALUES 
    ('خزينة المصروفات اليومية', 'sub', 5000.00, 'للمصروفات اليومية والعمليات الصغيرة'),
    ('خزينة الموردين', 'sub', 20000.00, 'لدفع فواتير الموردين'),
    ('خزينة المشاريع', 'sub', 30000.00, 'لتمويل المشاريع المختلفة')
ON CONFLICT DO NOTHING;