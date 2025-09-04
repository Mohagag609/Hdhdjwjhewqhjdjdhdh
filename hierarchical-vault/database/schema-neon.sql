-- قاعدة بيانات خزينة هرمية - Neon PostgreSQL
-- إنشاء الجداول

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الخزائن
CREATE TABLE IF NOT EXISTS vaults (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES vaults(id) ON DELETE CASCADE
);

-- جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    vault_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);

-- جدول التقارير المالية
CREATE TABLE IF NOT EXISTS financial_reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    vault_id INTEGER NOT NULL,
    project_id INTEGER NULL,
    user_id INTEGER NOT NULL,
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- جدول المعاملات المالية (للتتبع التفصيلي)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    from_vault_id INTEGER NULL,
    to_vault_id INTEGER NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_vault_id) REFERENCES vaults(id) ON DELETE SET NULL,
    FOREIGN KEY (to_vault_id) REFERENCES vaults(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- إدراج خزينة رئيسية افتراضية
INSERT INTO vaults (name, description, is_main) VALUES 
('الخزينة الرئيسية', 'الخزينة الرئيسية للنظام', TRUE)
ON CONFLICT DO NOTHING;

-- إدراج مستخدم أدمن افتراضي
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@hierarchical-vault.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;
-- كلمة المرور الافتراضية: password

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_vaults_parent ON vaults(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_vault ON projects(vault_id);
CREATE INDEX IF NOT EXISTS idx_reports_vault ON financial_reports(vault_id);
CREATE INDEX IF NOT EXISTS idx_reports_project ON financial_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON financial_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON financial_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vaults_updated_at ON vaults;
CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_reports_updated_at ON financial_reports;
CREATE TRIGGER update_financial_reports_updated_at BEFORE UPDATE ON financial_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();