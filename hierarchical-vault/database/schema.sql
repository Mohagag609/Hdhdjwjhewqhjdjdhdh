-- قاعدة بيانات خزينة هرمية
-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS hierarchical_vault;
USE hierarchical_vault;

-- جدول المستخدمين
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول الخزائن
CREATE TABLE vaults (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES vaults(id) ON DELETE CASCADE
);

-- جدول المشاريع
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    vault_id INT NOT NULL,
    status ENUM('active', 'completed', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);

-- جدول التقارير المالية
CREATE TABLE financial_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    vault_id INT NOT NULL,
    project_id INT NULL,
    user_id INT NOT NULL,
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- جدول المعاملات المالية (للتتبع التفصيلي)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    from_vault_id INT NULL,
    to_vault_id INT NULL,
    description TEXT,
    user_id INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_vault_id) REFERENCES vaults(id) ON DELETE SET NULL,
    FOREIGN KEY (to_vault_id) REFERENCES vaults(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- إدراج خزينة رئيسية افتراضية
INSERT INTO vaults (name, description, is_main) VALUES 
('الخزينة الرئيسية', 'الخزينة الرئيسية للنظام', TRUE);

-- إدراج مستخدم أدمن افتراضي
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@hierarchical-vault.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- كلمة المرور الافتراضية: password

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_vaults_parent ON vaults(parent_id);
CREATE INDEX idx_projects_vault ON projects(vault_id);
CREATE INDEX idx_reports_vault ON financial_reports(vault_id);
CREATE INDEX idx_reports_project ON financial_reports(project_id);
CREATE INDEX idx_reports_user ON financial_reports(user_id);
CREATE INDEX idx_reports_date ON financial_reports(report_date);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);