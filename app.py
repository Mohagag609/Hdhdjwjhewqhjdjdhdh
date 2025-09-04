#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام الخزنة الاحترافي
Professional Treasury Management System
"""

from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import json
from datetime import datetime, date
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'treasury_secret_key_2024'
CORS(app)

# إعدادات قاعدة البيانات
DATABASE = 'database/treasury.db'

def get_db_connection():
    """إنشاء اتصال بقاعدة البيانات"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """تهيئة قاعدة البيانات"""
    # إنشاء مجلد قاعدة البيانات
    os.makedirs('database', exist_ok=True)
    
    conn = get_db_connection()
    
    try:
        # قراءة ملف SQL وإنشاء الجداول
        with open('database.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # تنفيذ الأوامر SQL
        conn.executescript(sql_script)
        conn.commit()
        print("تم إنشاء قاعدة البيانات بنجاح")
    except sqlite3.IntegrityError as e:
        print(f"تحذير: {e}")
        # إذا كان هناك خطأ في التكرار، تجاهل الخطأ
        pass
    except Exception as e:
        print(f"خطأ في إنشاء قاعدة البيانات: {e}")
    finally:
        conn.close()
    
    # التأكد من وجود المستخدم الافتراضي
    ensure_default_user()

def ensure_default_user():
    """التأكد من وجود المستخدم الافتراضي"""
    conn = get_db_connection()
    
    try:
        # التحقق من وجود المستخدم admin
        user = conn.execute(
            'SELECT * FROM users WHERE username = ?', 
            ('admin',)
        ).fetchone()
        
        if not user:
            # إنشاء المستخدم الافتراضي
            hashed_password = hash_password('password')
            conn.execute("""
                INSERT INTO users (username, password, full_name, email, role) 
                VALUES (?, ?, ?, ?, ?)
            """, ('admin', hashed_password, 'مدير النظام', 'admin@treasury.com', 'admin'))
            conn.commit()
            print("تم إنشاء المستخدم الافتراضي")
        else:
            print("المستخدم الافتراضي موجود بالفعل")
            
    except Exception as e:
        print(f"خطأ في إنشاء المستخدم الافتراضي: {e}")
    finally:
        conn.close()

def login_required(f):
    """ديكوراتور للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'يجب تسجيل الدخول أولاً'}), 401
        return f(*args, **kwargs)
    return decorated_function

def hash_password(password):
    """تشفير كلمة المرور"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(stored_password, provided_password):
    """التحقق من كلمة المرور"""
    # إذا كانت كلمة المرور مشفرة بـ bcrypt
    if stored_password.startswith('$2y$'):
        import bcrypt
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))
    # إذا كانت مشفرة بـ SHA-256
    else:
        return stored_password == hash_password(provided_password)

def generate_transaction_number():
    """إنشاء رقم معاملة فريد"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.randbelow(1000)
    return f"TR{timestamp}{random_part:03d}"

# الصفحة الرئيسية
@app.route('/')
def index():
    return render_template('modern-index.html')

# API للمصادقة
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? AND is_active = 1', 
        (username,)
    ).fetchone()
    conn.close()
    
    if user and verify_password(user['password'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['full_name'] = user['full_name']
        session['role'] = user['role']
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'full_name': user['full_name'],
                'role': user['role']
            }
        })
    else:
        return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'full_name': session['full_name'],
                'role': session['role']
            }
        })
    return jsonify({'authenticated': False})

# API للوحة التحكم القديم - تم حذفه لاستبداله بالنسخة المحسنة

# API للمعاملات النقدية القديم - تم حذفه لاستبداله بالنسخة المحسنة

# API للشيكات
@app.route('/api/checks', methods=['GET'])
@login_required
def get_checks():
    conn = get_db_connection()
    
    checks = conn.execute('''
        SELECT c.*, p.name as party_name, t.name as treasury_name
        FROM checks c
        LEFT JOIN parties p ON c.party_id = p.id
        LEFT JOIN treasuries t ON c.treasury_id = t.id
        ORDER BY c.due_date ASC, c.created_at DESC
    ''').fetchall()
    
    conn.close()
    
    return jsonify([dict(check) for check in checks])

@app.route('/api/checks', methods=['POST'])
@login_required
def add_check():
    data = request.get_json()
    
    # التحقق من البيانات المطلوبة
    required_fields = ['check_number', 'type', 'amount', 'bank_name', 'party_id', 'issue_date', 'due_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'الحقل {field} مطلوب'}), 400
    
    conn = get_db_connection()
    
    try:
        # إدراج الشيك
        conn.execute('''
            INSERT INTO checks 
            (check_number, type, amount, bank_name, party_id, issue_date, due_date, treasury_id, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['check_number'],
            data['type'],
            data['amount'],
            data['bank_name'],
            data['party_id'],
            data['issue_date'],
            data['due_date'],
            data.get('treasury_id'),
            data.get('notes', ''),
            session['user_id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة الشيك بنجاح'})
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'خطأ في إضافة الشيك: {str(e)}'}), 500

# API للخزائن القديم - تم حذفه لاستبداله بالنسخة المحسنة

# API للأطراف القديم - تم حذفه لاستبداله بالنسخة المحسنة

# API للتقارير
@app.route('/api/reports/daily', methods=['GET'])
@login_required
def get_daily_report():
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    if not from_date or not to_date:
        return jsonify({'error': 'تاريخ البداية والنهاية مطلوبان'}), 400
    
    conn = get_db_connection()
    
    # تقرير المعاملات اليومية
    transactions = conn.execute('''
        SELECT ct.*, t.name as treasury_name, p.name as party_name
        FROM cash_transactions ct
        LEFT JOIN treasuries t ON ct.treasury_id = t.id
        LEFT JOIN parties p ON ct.party_id = p.id
        WHERE ct.transaction_date BETWEEN ? AND ?
        ORDER BY ct.transaction_date DESC, ct.created_at DESC
    ''', (from_date, to_date)).fetchall()
    
    # إحصائيات التقرير
    stats = conn.execute('''
        SELECT 
            type,
            COUNT(*) as count,
            SUM(amount) as total
        FROM cash_transactions 
        WHERE transaction_date BETWEEN ? AND ?
        GROUP BY type
    ''', (from_date, to_date)).fetchall()
    
    conn.close()
    
    return jsonify({
        'transactions': [dict(transaction) for transaction in transactions],
        'stats': [dict(stat) for stat in stats]
    })

# API للإعدادات
@app.route('/api/settings', methods=['GET'])
@login_required
def get_settings():
    conn = get_db_connection()
    
    settings = conn.execute('SELECT * FROM system_settings').fetchall()
    conn.close()
    
    settings_dict = {setting['setting_key']: setting['setting_value'] for setting in settings}
    return jsonify(settings_dict)

@app.route('/api/settings', methods=['POST'])
@login_required
def update_settings():
    data = request.get_json()
    
    conn = get_db_connection()
    
    try:
        for key, value in data.items():
            conn.execute('''
                INSERT OR REPLACE INTO system_settings (setting_key, setting_value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (key, value))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم تحديث الإعدادات بنجاح'})
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'خطأ في تحديث الإعدادات: {str(e)}'}), 500

# API للوحة التحكم
@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    """الحصول على إحصائيات لوحة التحكم"""
    try:
        conn = get_db_connection()
        
        # إجمالي الإيرادات
        total_income = conn.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = "receipt"'
        ).fetchone()['total']
        
        # إجمالي المصروفات
        total_expenses = conn.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = "payment"'
        ).fetchone()['total']
        
        # صافي الربح
        net_profit = total_income - total_expenses
        
        # الرصيد النقدي
        cash_balance = conn.execute(
            'SELECT COALESCE(SUM(current_balance), 0) as total FROM treasuries WHERE is_active = 1'
        ).fetchone()['total']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'totalIncome': total_income,
                'totalExpenses': total_expenses,
                'netProfit': net_profit,
                'cashBalance': cash_balance
            }
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل الإحصائيات: {str(e)}'}), 500

@app.route('/api/transactions/recent', methods=['GET'])
@login_required
def get_recent_transactions():
    """الحصول على المعاملات الأخيرة"""
    try:
        conn = get_db_connection()
        
        transactions = conn.execute('''
            SELECT ct.*, t.name as treasury_name
            FROM cash_transactions ct
            LEFT JOIN treasuries t ON ct.treasury_id = t.id
            ORDER BY ct.created_at DESC
            LIMIT 10
        ''').fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(transaction) for transaction in transactions]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل المعاملات: {str(e)}'}), 500

@app.route('/api/transactions', methods=['GET'])
@login_required
def get_all_transactions():
    """الحصول على جميع المعاملات"""
    try:
        conn = get_db_connection()
        
        # فلاتر البحث
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        transaction_type = request.args.get('type')
        
        query = '''
            SELECT ct.*, t.name as treasury_name
            FROM cash_transactions ct
            LEFT JOIN treasuries t ON ct.treasury_id = t.id
            WHERE 1=1
        '''
        params = []
        
        if from_date:
            query += ' AND DATE(ct.created_at) >= ?'
            params.append(from_date)
        
        if to_date:
            query += ' AND DATE(ct.created_at) <= ?'
            params.append(to_date)
        
        if transaction_type:
            query += ' AND ct.type = ?'
            params.append(transaction_type)
        
        query += ' ORDER BY ct.created_at DESC'
        
        transactions = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(transaction) for transaction in transactions]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل المعاملات: {str(e)}'}), 500

@app.route('/api/transactions', methods=['POST'])
@login_required
def add_transaction():
    """إضافة معاملة جديدة"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['type', 'amount', 'description', 'treasury_id']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        conn = get_db_connection()
        
        # إنشاء رقم المعاملة
        transaction_number = generate_transaction_number()
        
        # إضافة المعاملة
        conn.execute('''
            INSERT INTO cash_transactions 
            (transaction_number, type, amount, description, treasury_id, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            transaction_number,
            data['type'],
            data['amount'],
            data['description'],
            data['treasury_id'],
            session['user_id']
        ))
        
        # تحديث رصيد الخزينة
        if data['type'] == 'receipt':
            conn.execute('''
                UPDATE treasuries 
                SET current_balance = current_balance + ? 
                WHERE id = ?
            ''', (data['amount'], data['treasury_id']))
        else:
            conn.execute('''
                UPDATE treasuries 
                SET current_balance = current_balance - ? 
                WHERE id = ?
            ''', (data['amount'], data['treasury_id']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة المعاملة بنجاح'})
    except Exception as e:
        return jsonify({'error': f'خطأ في إضافة المعاملة: {str(e)}'}), 500

@app.route('/api/treasuries', methods=['GET'])
@login_required
def get_treasuries():
    """الحصول على قائمة الخزائن"""
    try:
        conn = get_db_connection()
        treasuries = conn.execute(
            'SELECT * FROM treasuries WHERE is_active = 1 ORDER BY name'
        ).fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(treasury) for treasury in treasuries]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل الخزائن: {str(e)}'}), 500

@app.route('/api/parties', methods=['GET'])
@login_required
def get_parties():
    """الحصول على قائمة العملاء والموردين"""
    try:
        party_type = request.args.get('type', 'customer')
        conn = get_db_connection()
        
        parties = conn.execute(
            'SELECT * FROM parties WHERE type = ? AND is_active = 1 ORDER BY name',
            (party_type,)
        ).fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(party) for party in parties]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل {party_type}: {str(e)}'}), 500

@app.route('/api/parties', methods=['POST'])
@login_required
def add_party():
    """إضافة عميل أو مورد جديد"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        conn = get_db_connection()
        
        conn.execute('''
            INSERT INTO parties (name, type, phone, email, address, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['type'],
            data.get('phone', ''),
            data.get('email', ''),
            data.get('address', ''),
            session['user_id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': f'تم إضافة {data["type"]} بنجاح'})
    except Exception as e:
        return jsonify({'error': f'خطأ في إضافة {data.get("type", "العنصر")}: {str(e)}'}), 500

# API للمنتجات والمخزون
@app.route('/api/products', methods=['GET'])
@login_required
def get_products():
    """الحصول على قائمة المنتجات"""
    try:
        conn = get_db_connection()
        products = conn.execute(
            'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
        ).fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(product) for product in products]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل المنتجات: {str(e)}'}), 500

@app.route('/api/products', methods=['POST'])
@login_required
def add_product():
    """إضافة منتج جديد"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'purchase_price', 'sale_price']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        conn = get_db_connection()
        
        # إنشاء SKU تلقائي
        sku = f"SKU{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        conn.execute('''
            INSERT INTO products (name, description, category, sku, purchase_price, sale_price, quantity, min_quantity, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('description', ''),
            data.get('category', ''),
            sku,
            data['purchase_price'],
            data['sale_price'],
            data.get('quantity', 0),
            data.get('min_quantity', 0),
            session['user_id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة المنتج بنجاح'})
    except Exception as e:
        return jsonify({'error': f'خطأ في إضافة المنتج: {str(e)}'}), 500

# API للفواتير
@app.route('/api/invoices', methods=['GET'])
@login_required
def get_invoices():
    """الحصول على قائمة الفواتير"""
    try:
        conn = get_db_connection()
        
        invoices = conn.execute('''
            SELECT i.*, p.name as customer_name
            FROM invoices i
            LEFT JOIN parties p ON i.customer_id = p.id
            ORDER BY i.created_at DESC
        ''').fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(invoice) for invoice in invoices]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل الفواتير: {str(e)}'}), 500

@app.route('/api/invoices', methods=['POST'])
@login_required
def add_invoice():
    """إضافة فاتورة جديدة"""
    try:
        data = request.get_json()
        
        required_fields = ['customer_id', 'amount', 'due_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        conn = get_db_connection()
        
        # إنشاء رقم الفاتورة
        invoice_number = f"INV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # حساب الضريبة والمبلغ الإجمالي
        tax_rate = 0.15  # 15% ضريبة القيمة المضافة
        tax_amount = data['amount'] * tax_rate
        total_amount = data['amount'] + tax_amount
        
        conn.execute('''
            INSERT INTO invoices (invoice_number, customer_id, amount, tax_amount, total_amount, issue_date, due_date, description, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            invoice_number,
            data['customer_id'],
            data['amount'],
            tax_amount,
            total_amount,
            datetime.now().date(),
            data['due_date'],
            data.get('description', ''),
            session['user_id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة الفاتورة بنجاح'})
    except Exception as e:
        return jsonify({'error': f'خطأ في إضافة الفاتورة: {str(e)}'}), 500

# API للإشعارات
@app.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    """الحصول على الإشعارات"""
    try:
        conn = get_db_connection()
        
        notifications = conn.execute('''
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        ''', (session['user_id'],)).fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(notification) for notification in notifications]
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل الإشعارات: {str(e)}'}), 500

@app.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    """تحديد الإشعار كمقروء"""
    try:
        conn = get_db_connection()
        
        conn.execute('''
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = ? AND user_id = ?
        ''', (notification_id, session['user_id']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم تحديث الإشعار'})
    except Exception as e:
        return jsonify({'error': f'خطأ في تحديث الإشعار: {str(e)}'}), 500

# API للتقارير
@app.route('/api/reports/financial-summary', methods=['GET'])
@login_required
def get_financial_summary():
    """تقرير ملخص مالي"""
    try:
        conn = get_db_connection()
        
        # إحصائيات الشهر الحالي
        current_month = datetime.now().strftime('%Y-%m')
        
        monthly_income = conn.execute('''
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM cash_transactions 
            WHERE type = 'receipt' 
            AND strftime('%Y-%m', created_at) = ?
        ''', (current_month,)).fetchone()['total']
        
        monthly_expenses = conn.execute('''
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM cash_transactions 
            WHERE type = 'payment' 
            AND strftime('%Y-%m', created_at) = ?
        ''', (current_month,)).fetchone()['total']
        
        # إحصائيات العام الحالي
        current_year = datetime.now().year
        
        yearly_income = conn.execute('''
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM cash_transactions 
            WHERE type = 'receipt' 
            AND strftime('%Y', created_at) = ?
        ''', (str(current_year),)).fetchone()['total']
        
        yearly_expenses = conn.execute('''
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM cash_transactions 
            WHERE type = 'payment' 
            AND strftime('%Y', created_at) = ?
        ''', (str(current_year),)).fetchone()['total']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'monthly': {
                    'income': monthly_income,
                    'expenses': monthly_expenses,
                    'profit': monthly_income - monthly_expenses
                },
                'yearly': {
                    'income': yearly_income,
                    'expenses': yearly_expenses,
                    'profit': yearly_income - yearly_expenses
                }
            }
        })
    except Exception as e:
        return jsonify({'error': f'خطأ في تحميل التقرير: {str(e)}'}), 500

if __name__ == '__main__':
    # تهيئة قاعدة البيانات
    init_database()
    
    # الحصول على المنفذ من متغير البيئة أو استخدام المنفذ الافتراضي
    port = int(os.environ.get('PORT', 5000))
    
    # تشغيل الخادم
    app.run(debug=False, host='0.0.0.0', port=port)