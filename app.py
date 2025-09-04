#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام الخزنة الاحترافي المتكامل
Professional Treasury Management System
"""

from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from flask_cors import CORS
import sqlite3
import hashlib
import os
import json
from datetime import datetime, date, timedelta
from functools import wraps
import uuid

app = Flask(__name__)
app.secret_key = 'treasury_professional_secret_key_2024'
CORS(app)

# إعدادات قاعدة البيانات
DATABASE = 'treasury.db'

def get_db_connection():
    """إنشاء اتصال بقاعدة البيانات"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """تهيئة قاعدة البيانات"""
    conn = get_db_connection()
    
    try:
        with open('database.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        conn.executescript(sql_script)
        conn.commit()
        print("تم إنشاء قاعدة البيانات بنجاح")
    except Exception as e:
        print(f"خطأ في إنشاء قاعدة البيانات: {e}")
    finally:
        conn.close()

def hash_password(password):
    """تشفير كلمة المرور"""
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    """ديكوراتور للتحقق من تسجيل الدخول"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json:
                return jsonify({'error': 'يجب تسجيل الدخول أولاً'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """ديكوراتور للتحقق من صلاحيات المدير"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') not in ['admin', 'manager']:
            if request.is_json:
                return jsonify({'error': 'ليس لديك صلاحية للوصول'}), 403
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

def log_activity(action, table_name=None, record_id=None, old_values=None, new_values=None):
    """تسجيل نشاط المستخدم"""
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            session.get('user_id'),
            action,
            table_name,
            record_id,
            json.dumps(old_values) if old_values else None,
            json.dumps(new_values) if new_values else None,
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
        conn.commit()
    except Exception as e:
        print(f"خطأ في تسجيل النشاط: {e}")
    finally:
        conn.close()

# الصفحات الرئيسية
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect('/dashboard')
    return redirect('/login')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/treasuries')
@login_required
def treasuries():
    return render_template('treasuries.html')

@app.route('/customers')
@login_required
def customers():
    return render_template('customers.html')

@app.route('/suppliers')
@login_required
def suppliers():
    return render_template('suppliers.html')

@app.route('/products')
@login_required
def products():
    return render_template('products.html')

@app.route('/invoices')
@login_required
def invoices():
    return render_template('invoices.html')

@app.route('/transactions')
@login_required
def transactions():
    return render_template('transactions.html')

@app.route('/inventory')
@login_required
def inventory():
    return render_template('inventory.html')

@app.route('/reports')
@login_required
def reports():
    return render_template('reports.html')

@app.route('/settings')
@login_required
@admin_required
def settings():
    return render_template('settings.html')

# APIs للمصادقة
@app.route('/api/login', methods=['POST'])
def api_login():
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
    
    if user and user['password'] == hash_password(password):
        # تحديث آخر تسجيل دخول
        conn.execute(
            'UPDATE users SET last_login = ? WHERE id = ?',
            (datetime.now(), user['id'])
        )
        conn.commit()
        
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['full_name'] = user['full_name']
        session['role'] = user['role']
        
        log_activity('تسجيل دخول')
        
        conn.close()
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
        conn.close()
        return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    log_activity('تسجيل خروج')
    session.clear()
    return jsonify({'success': True})

# APIs للخزائن
@app.route('/api/treasuries')
@login_required
def api_get_treasuries():
    conn = get_db_connection()
    treasuries = conn.execute('''
        SELECT t.*, 
               COALESCE(parent.name, '') as parent_name,
               (SELECT COUNT(*) FROM treasuries child WHERE child.parent_id = t.id) as children_count
        FROM treasuries t
        LEFT JOIN treasuries parent ON t.parent_id = parent.id
        WHERE t.is_active = 1
        ORDER BY t.parent_id, t.name
    ''').fetchall()
    conn.close()
    
    return jsonify({
        'success': True,
        'data': [dict(treasury) for treasury in treasuries]
    })

@app.route('/api/treasuries', methods=['POST'])
@login_required
@admin_required
def api_add_treasury():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'اسم الخزينة مطلوب'}), 400
    
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO treasuries (name, parent_id, balance, currency, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('parent_id'),
            data.get('balance', 0),
            data.get('currency', 'SAR'),
            data.get('description', '')
        ))
        
        treasury_id = conn.lastrowid
        conn.commit()
        
        log_activity('إضافة خزينة', 'treasuries', treasury_id, None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم إضافة الخزينة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في إضافة الخزينة: {str(e)}'}), 500

# APIs للعملاء
@app.route('/api/customers')
@login_required
def api_get_customers():
    conn = get_db_connection()
    customers = conn.execute('''
        SELECT c.*, 
               (SELECT COUNT(*) FROM invoices WHERE customer_id = c.id) as invoices_count,
               (SELECT COALESCE(SUM(remaining_amount), 0) FROM invoices WHERE customer_id = c.id AND status != 'paid') as total_debt
        FROM customers c
        WHERE c.is_active = 1
        ORDER BY c.name
    ''').fetchall()
    conn.close()
    
    return jsonify({
        'success': True,
        'data': [dict(customer) for customer in customers]
    })

@app.route('/api/customers', methods=['POST'])
@login_required
def api_add_customer():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'اسم العميل مطلوب'}), 400
    
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO customers (name, email, phone, address, credit_limit)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('email', ''),
            data.get('phone', ''),
            data.get('address', ''),
            data.get('credit_limit', 0)
        ))
        
        customer_id = conn.lastrowid
        conn.commit()
        
        log_activity('إضافة عميل', 'customers', customer_id, None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم إضافة العميل بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في إضافة العميل: {str(e)}'}), 500

# APIs للموردين
@app.route('/api/suppliers')
@login_required
def api_get_suppliers():
    conn = get_db_connection()
    suppliers = conn.execute('''
        SELECT s.*, 
               (SELECT COUNT(*) FROM invoices WHERE supplier_id = s.id) as invoices_count,
               (SELECT COALESCE(SUM(remaining_amount), 0) FROM invoices WHERE supplier_id = s.id AND status != 'paid') as total_debt
        FROM suppliers s
        WHERE s.is_active = 1
        ORDER BY s.name
    ''').fetchall()
    conn.close()
    
    return jsonify({
        'success': True,
        'data': [dict(supplier) for supplier in suppliers]
    })

@app.route('/api/suppliers', methods=['POST'])
@login_required
def api_add_supplier():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'اسم المورد مطلوب'}), 400
    
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO suppliers (name, email, phone, address, credit_limit)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('email', ''),
            data.get('phone', ''),
            data.get('address', ''),
            data.get('credit_limit', 0)
        ))
        
        supplier_id = conn.lastrowid
        conn.commit()
        
        log_activity('إضافة مورد', 'suppliers', supplier_id, None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم إضافة المورد بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في إضافة المورد: {str(e)}'}), 500

# APIs للمنتجات
@app.route('/api/products')
@login_required
def api_get_products():
    conn = get_db_connection()
    products = conn.execute('''
        SELECT p.*, 
               CASE 
                   WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
                   WHEN p.stock_quantity = 0 THEN 'out_of_stock'
                   ELSE 'in_stock'
               END as stock_status
        FROM products p
        WHERE p.is_active = 1
        ORDER BY p.name
    ''').fetchall()
    conn.close()
    
    return jsonify({
        'success': True,
        'data': [dict(product) for product in products]
    })

@app.route('/api/products', methods=['POST'])
@login_required
def api_add_product():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'اسم المنتج مطلوب'}), 400
    
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO products (name, description, sku, category, unit_price, cost_price, stock_quantity, min_stock_level, unit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data.get('description', ''),
            data.get('sku', ''),
            data.get('category', ''),
            data.get('unit_price', 0),
            data.get('cost_price', 0),
            data.get('stock_quantity', 0),
            data.get('min_stock_level', 0),
            data.get('unit', 'piece')
        ))
        
        product_id = conn.lastrowid
        conn.commit()
        
        log_activity('إضافة منتج', 'products', product_id, None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم إضافة المنتج بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في إضافة المنتج: {str(e)}'}), 500

# APIs للمعاملات
@app.route('/api/transactions')
@login_required
def api_get_transactions():
    conn = get_db_connection()
    
    # معاملات مع تفاصيل إضافية
    transactions = conn.execute('''
        SELECT t.*, 
               tr.name as treasury_name,
               u.full_name as user_name,
               c.name as customer_name,
               s.name as supplier_name
        FROM transactions t
        LEFT JOIN treasuries tr ON t.treasury_id = tr.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN customers c ON t.customer_id = c.id
        LEFT JOIN suppliers s ON t.supplier_id = s.id
        ORDER BY t.transaction_date DESC
        LIMIT 100
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': [dict(transaction) for transaction in transactions]
    })

@app.route('/api/transactions', methods=['POST'])
@login_required
def api_add_transaction():
    data = request.get_json()
    
    required_fields = ['type', 'amount', 'description', 'treasury_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'الحقل {field} مطلوب'}), 400
    
    conn = get_db_connection()
    
    try:
        # إضافة المعاملة
        conn.execute('''
            INSERT INTO transactions (type, amount, description, reference, treasury_id, user_id, customer_id, supplier_id, transaction_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['type'],
            data['amount'],
            data['description'],
            data.get('reference', ''),
            data['treasury_id'],
            session['user_id'],
            data.get('customer_id'),
            data.get('supplier_id'),
            data.get('transaction_date', datetime.now())
        ))
        
        transaction_id = conn.lastrowid
        
        # تحديث رصيد الخزينة
        if data['type'] == 'income':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance + ? 
                WHERE id = ?
            ''', (data['amount'], data['treasury_id']))
        elif data['type'] == 'expense':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance - ? 
                WHERE id = ?
            ''', (data['amount'], data['treasury_id']))
        
        conn.commit()
        
        log_activity('إضافة معاملة', 'transactions', transaction_id, None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم إضافة المعاملة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في إضافة المعاملة: {str(e)}'}), 500

# APIs للإحصائيات
@app.route('/api/dashboard/stats')
@login_required
def api_dashboard_stats():
    conn = get_db_connection()
    
    # إجمالي رصيد الخزائن
    total_balance = conn.execute('SELECT COALESCE(SUM(balance), 0) as total FROM treasuries WHERE is_active = 1').fetchone()['total']
    
    # إجمالي الإيرادات (آخر 30 يوم)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    total_income = conn.execute('''
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE type = 'income' AND transaction_date >= ?
    ''', (thirty_days_ago,)).fetchone()['total']
    
    # إجمالي المصروفات (آخر 30 يوم)
    total_expenses = conn.execute('''
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE type = 'expense' AND transaction_date >= ?
    ''', (thirty_days_ago,)).fetchone()['total']
    
    # عدد العملاء
    customers_count = conn.execute('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').fetchone()['count']
    
    # عدد الموردين
    suppliers_count = conn.execute('SELECT COUNT(*) as count FROM suppliers WHERE is_active = 1').fetchone()['count']
    
    # عدد المنتجات
    products_count = conn.execute('SELECT COUNT(*) as count FROM products WHERE is_active = 1').fetchone()['count']
    
    # المنتجات منخفضة المخزون
    low_stock_products = conn.execute('''
        SELECT COUNT(*) as count 
        FROM products 
        WHERE is_active = 1 AND stock_quantity <= min_stock_level
    ''').fetchone()['count']
    
    # الفواتير المعلقة
    pending_invoices = conn.execute('''
        SELECT COUNT(*) as count 
        FROM invoices 
        WHERE status IN ('pending', 'partial')
    ''').fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'total_balance': total_balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_profit': total_income - total_expenses,
            'customers_count': customers_count,
            'suppliers_count': suppliers_count,
            'products_count': products_count,
            'low_stock_products': low_stock_products,
            'pending_invoices': pending_invoices
        }
    })

if __name__ == '__main__':
    init_database()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)