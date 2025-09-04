-- نظام الخزنة الاحترافي المبسط
-- Simplified Professional Treasury Management System

-- جدول المستخدمين والأدوار
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الخزائن الهرمية
CREATE TABLE IF NOT EXISTS treasuries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER DEFAULT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'SAR',
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES treasuries(id)
);

-- جدول المعاملات المالية
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(50),
    treasury_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول الشيكات
CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SAR',
    issue_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
    treasury_id INTEGER,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    user_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول إعدادات النظام
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول سجل الأنشطة
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- إدراج البيانات الافتراضية
INSERT INTO users (username, password, full_name, email, role) VALUES 
('admin', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'مدير النظام', 'admin@treasury.com', 'admin');

INSERT INTO treasuries (name, balance, currency, description) VALUES 
('الخزينة الرئيسية', 0.00, 'SAR', 'الخزينة الرئيسية للنظام'),
('خزينة النقدية', 0.00, 'SAR', 'خزينة النقدية المتاحة'),
('خزينة البنك', 0.00, 'SAR', 'حساب البنك الرئيسي'),
('خزينة الطوارئ', 0.00, 'SAR', 'خزينة الطوارئ');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('company_name', 'شركة الخزنة الاحترافية', 'اسم الشركة'),
('company_address', 'الرياض، المملكة العربية السعودية', 'عنوان الشركة'),
('company_phone', '+966 11 123 4567', 'هاتف الشركة'),
('company_email', 'info@treasury.com', 'بريد الشركة الإلكتروني'),
('default_currency', 'SAR', 'العملة الافتراضية'),
('check_prefix', 'CHK', 'بادئة أرقام الشيكات');