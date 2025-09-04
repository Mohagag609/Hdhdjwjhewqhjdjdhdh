-- نظام الخزنة الاحترافي المتكامل
-- Professional Treasury Management System

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

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الموردين
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(50),
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'piece',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    customer_id INTEGER,
    supplier_id INTEGER,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('sale', 'purchase')),
    customer_id INTEGER,
    supplier_id INTEGER,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    remaining_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'cancelled')),
    due_date DATE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول عناصر الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type VARCHAR(20) CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_value DECIMAL(10,2),
    reference VARCHAR(50),
    description TEXT,
    user_id INTEGER NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
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
    customer_id INTEGER,
    supplier_id INTEGER,
    treasury_id INTEGER,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
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
('invoice_prefix', 'INV', 'بادئة أرقام الفواتير'),
('check_prefix', 'CHK', 'بادئة أرقام الشيكات');

-- إدراج عينات من العملاء
INSERT INTO customers (name, email, phone, address, credit_limit) VALUES 
('أحمد محمد', 'ahmed@email.com', '0501234567', 'الرياض، حي النخيل', 50000.00),
('فاطمة علي', 'fatima@email.com', '0507654321', 'جدة، حي الزهراء', 30000.00),
('محمد السعد', 'mohammed@email.com', '0509876543', 'الدمام، حي الفردوس', 25000.00);

-- إدراج عينات من الموردين
INSERT INTO suppliers (name, email, phone, address, credit_limit) VALUES 
('مؤسسة التوريدات العامة', 'supplies@company.com', '0112345678', 'الرياض، حي العليا', 100000.00),
('شركة الخدمات المتكاملة', 'services@company.com', '0118765432', 'جدة، حي الروضة', 75000.00),
('مؤسسة المواد الخام', 'materials@company.com', '0134567890', 'الدمام، حي الشاطئ', 60000.00);

-- إدراج عينات من المنتجات
INSERT INTO products (name, description, sku, category, unit_price, cost_price, stock_quantity, min_stock_level, unit) VALUES 
('جهاز كمبيوتر محمول', 'لابتوب عالي الأداء', 'LAP001', 'إلكترونيات', 3500.00, 2800.00, 10, 2, 'piece'),
('طابعة ليزر', 'طابعة مكتبية عالية الجودة', 'PRT001', 'معدات مكتبية', 800.00, 600.00, 5, 1, 'piece'),
('كراسي مكتب', 'كراسي مريحة للمكتب', 'CHR001', 'أثاث', 150.00, 100.00, 50, 10, 'piece'),
('أوراق A4', 'أوراق طباعة عالية الجودة', 'PAP001', 'مستلزمات مكتبية', 25.00, 18.00, 100, 20, 'ream');