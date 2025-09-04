-- قاعدة بيانات نظام الخزنة الاحترافي
-- إنشاء قاعدة البيانات والجداول المطلوبة

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الخزائن
CREATE TABLE IF NOT EXISTS treasuries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    currency VARCHAR(10) DEFAULT 'SAR',
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول العملاء والموردين
CREATE TABLE IF NOT EXISTS parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('customer', 'supplier', 'both')),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المعاملات النقدية
CREATE TABLE IF NOT EXISTS cash_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('receipt', 'payment')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    treasury_id INTEGER NOT NULL,
    party_id INTEGER,
    transaction_date DATE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول الشيكات
CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_number VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('received', 'issued')),
    amount DECIMAL(15,2) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    party_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
    treasury_id INTEGER,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول تحويلات الخزائن
CREATE TABLE IF NOT EXISTS treasury_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_treasury_id INTEGER NOT NULL,
    to_treasury_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    description TEXT,
    transfer_date DATE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (to_treasury_id) REFERENCES treasuries(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول إعدادات النظام
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول سجل العمليات
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

-- إدراج البيانات الأولية

-- ملاحظة: المستخدم الافتراضي سيتم إنشاؤه تلقائياً بواسطة التطبيق

-- إدراج خزينة رئيسية افتراضية
INSERT INTO treasuries (name, description, currency, initial_balance, current_balance) VALUES 
('الخزينة الرئيسية', 'الخزينة الرئيسية للنظام', 'SAR', 0.00, 0.00);

-- جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES parties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    sku VARCHAR(50) UNIQUE,
    purchase_price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'قطعة',
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول حركة المخزون
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    reference_type VARCHAR(50), -- 'purchase', 'sale', 'adjustment'
    reference_id INTEGER,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER,
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    sale_date DATE NOT NULL,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES parties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول تفاصيل المبيعات
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول المشتريات
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER,
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    purchase_date DATE NOT NULL,
    expected_delivery DATE,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES parties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول تفاصيل المشتريات
CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- إدراج بيانات تجريبية
INSERT INTO products (name, description, category, sku, purchase_price, sale_price, quantity, min_quantity, created_by) VALUES 
('منتج تجريبي 1', 'وصف المنتج التجريبي', 'إلكترونيات', 'SKU001', 100.00, 150.00, 50, 10, 1),
('منتج تجريبي 2', 'وصف المنتج التجريبي', 'ملابس', 'SKU002', 50.00, 80.00, 30, 5, 1);

INSERT INTO parties (name, type, phone, email, address, created_by) VALUES 
('عميل تجريبي', 'customer', '0501234567', 'customer@example.com', 'الرياض، المملكة العربية السعودية', 1),
('مورد تجريبي', 'supplier', '0507654321', 'supplier@example.com', 'جدة، المملكة العربية السعودية', 1);

-- إدراج إعدادات النظام الافتراضية
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('company_name', 'شركة الخزنة الاحترافية', 'اسم الشركة'),
('base_currency', 'SAR', 'العملة الأساسية'),
('date_format', 'Y-m-d', 'تنسيق التاريخ'),
('timezone', 'Asia/Riyadh', 'المنطقة الزمنية'),
('backup_enabled', '1', 'تفعيل النسخ الاحتياطي'),
('backup_frequency', 'daily', 'تكرار النسخ الاحتياطي');

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_type ON cash_transactions(type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_treasury ON cash_transactions(treasury_id);
CREATE INDEX IF NOT EXISTS idx_checks_due_date ON checks(due_date);
CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(status);
CREATE INDEX IF NOT EXISTS idx_checks_type ON checks(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);

-- إنشاء Views للتقارير
CREATE VIEW IF NOT EXISTS daily_cash_summary AS
SELECT 
    DATE(transaction_date) as date,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM cash_transactions 
GROUP BY DATE(transaction_date), type;

CREATE VIEW IF NOT EXISTS treasury_balances AS
SELECT 
    t.id,
    t.name,
    t.currency,
    t.current_balance,
    COALESCE(SUM(ct.amount), 0) as total_receipts,
    COALESCE(SUM(CASE WHEN ct.type = 'payment' THEN ct.amount ELSE 0 END), 0) as total_payments
FROM treasuries t
LEFT JOIN cash_transactions ct ON t.id = ct.treasury_id
WHERE t.is_active = 1
GROUP BY t.id, t.name, t.currency, t.current_balance;

-- إنشاء Triggers لتحديث الأرصدة تلقائياً
CREATE TRIGGER IF NOT EXISTS update_treasury_balance_after_cash_transaction
AFTER INSERT ON cash_transactions
BEGIN
    UPDATE treasuries 
    SET current_balance = current_balance + 
        CASE 
            WHEN NEW.type = 'receipt' THEN NEW.amount 
            ELSE -NEW.amount 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.treasury_id;
END;

CREATE TRIGGER IF NOT EXISTS update_treasury_balance_after_cash_update
AFTER UPDATE ON cash_transactions
BEGIN
    -- إعادة حساب الرصيد بناءً على القيم الجديدة
    UPDATE treasuries 
    SET current_balance = current_balance - 
        CASE 
            WHEN OLD.type = 'receipt' THEN OLD.amount 
            ELSE -OLD.amount 
        END +
        CASE 
            WHEN NEW.type = 'receipt' THEN NEW.amount 
            ELSE -NEW.amount 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.treasury_id;
END;

CREATE TRIGGER IF NOT EXISTS update_treasury_balance_after_cash_delete
AFTER DELETE ON cash_transactions
BEGIN
    UPDATE treasuries 
    SET current_balance = current_balance - 
        CASE 
            WHEN OLD.type = 'receipt' THEN OLD.amount 
            ELSE -OLD.amount 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.treasury_id;
END;