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
    
    # قراءة ملف SQL وإنشاء الجداول
    with open('database.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # تنفيذ الأوامر SQL
    conn.executescript(sql_script)
    conn.commit()
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

def generate_transaction_number():
    """إنشاء رقم معاملة فريد"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.randbelow(1000)
    return f"TR{timestamp}{random_part:03d}"

# الصفحة الرئيسية
@app.route('/')
def index():
    return render_template('index.html')

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
    
    if user and user['password'] == hash_password(password):
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

# API للوحة التحكم
@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    conn = get_db_connection()
    
    # إجمالي النقدية
    total_cash = conn.execute(
        'SELECT SUM(current_balance) as total FROM treasuries WHERE is_active = 1'
    ).fetchone()['total'] or 0
    
    # الشيكات المستحقة
    due_checks = conn.execute(
        'SELECT COUNT(*) as count FROM checks WHERE due_date <= date("now") AND status = "pending"'
    ).fetchone()['count']
    
    # المبيعات اليوم
    today_sales = conn.execute(
        'SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = "receipt" AND transaction_date = date("now")'
    ).fetchone()['total']
    
    # المصروفات اليوم
    today_expenses = conn.execute(
        'SELECT COALESCE(SUM(amount), 0) as total FROM cash_transactions WHERE type = "payment" AND transaction_date = date("now")'
    ).fetchone()['total']
    
    conn.close()
    
    return jsonify({
        'total_cash': float(total_cash),
        'due_checks': due_checks,
        'today_sales': float(today_sales),
        'today_expenses': float(today_expenses)
    })

# API للمعاملات النقدية
@app.route('/api/cash/transactions', methods=['GET'])
@login_required
def get_cash_transactions():
    conn = get_db_connection()
    
    transactions = conn.execute('''
        SELECT ct.*, t.name as treasury_name, p.name as party_name
        FROM cash_transactions ct
        LEFT JOIN treasuries t ON ct.treasury_id = t.id
        LEFT JOIN parties p ON ct.party_id = p.id
        ORDER BY ct.transaction_date DESC, ct.created_at DESC
    ''').fetchall()
    
    conn.close()
    
    return jsonify([dict(transaction) for transaction in transactions])

@app.route('/api/cash/transactions', methods=['POST'])
@login_required
def add_cash_transaction():
    data = request.get_json()
    
    # التحقق من البيانات المطلوبة
    required_fields = ['type', 'amount', 'description', 'treasury_id', 'transaction_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'الحقل {field} مطلوب'}), 400
    
    conn = get_db_connection()
    
    try:
        # إنشاء رقم المعاملة
        transaction_number = generate_transaction_number()
        
        # إدراج المعاملة
        conn.execute('''
            INSERT INTO cash_transactions 
            (transaction_number, type, amount, description, treasury_id, party_id, transaction_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction_number,
            data['type'],
            data['amount'],
            data['description'],
            data['treasury_id'],
            data.get('party_id'),
            data['transaction_date'],
            session['user_id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة المعاملة بنجاح'})
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'خطأ في إضافة المعاملة: {str(e)}'}), 500

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

# API للخزائن
@app.route('/api/treasuries', methods=['GET'])
@login_required
def get_treasuries():
    conn = get_db_connection()
    
    treasuries = conn.execute('''
        SELECT * FROM treasury_balances WHERE is_active = 1
        ORDER BY name
    ''').fetchall()
    
    conn.close()
    
    return jsonify([dict(treasury) for treasury in treasuries])

# API للأطراف (العملاء والموردين)
@app.route('/api/parties', methods=['GET'])
@login_required
def get_parties():
    conn = get_db_connection()
    
    parties = conn.execute('''
        SELECT * FROM parties WHERE is_active = 1
        ORDER BY name
    ''').fetchall()
    
    conn.close()
    
    return jsonify([dict(party) for party in parties])

@app.route('/api/parties', methods=['POST'])
@login_required
def add_party():
    data = request.get_json()
    
    required_fields = ['name', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'الحقل {field} مطلوب'}), 400
    
    conn = get_db_connection()
    
    try:
        conn.execute('''
            INSERT INTO parties (name, type, phone, email, address)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['type'],
            data.get('phone', ''),
            data.get('email', ''),
            data.get('address', '')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'تم إضافة الطرف بنجاح'})
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': f'خطأ في إضافة الطرف: {str(e)}'}), 500

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

if __name__ == '__main__':
    # تهيئة قاعدة البيانات
    init_database()
    
    # الحصول على المنفذ من متغير البيئة أو استخدام المنفذ الافتراضي
    port = int(os.environ.get('PORT', 5000))
    
    # تشغيل الخادم
    app.run(debug=False, host='0.0.0.0', port=port)