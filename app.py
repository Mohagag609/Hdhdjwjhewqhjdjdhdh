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

@app.route('/transactions')
@login_required
def transactions():
    return render_template('transactions.html')

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

@app.route('/api/treasuries/<int:treasury_id>', methods=['PUT'])
@login_required
@admin_required
def api_update_treasury(treasury_id):
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'اسم الخزينة مطلوب'}), 400
    
    conn = get_db_connection()
    try:
        # الحصول على البيانات القديمة للتسجيل
        old_treasury = conn.execute('SELECT * FROM treasuries WHERE id = ?', (treasury_id,)).fetchone()
        
        conn.execute('''
            UPDATE treasuries 
            SET name = ?, parent_id = ?, currency = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data['name'],
            data.get('parent_id'),
            data.get('currency', 'SAR'),
            data.get('description', ''),
            treasury_id
        ))
        
        conn.commit()
        
        log_activity('تعديل خزينة', 'treasuries', treasury_id, dict(old_treasury) if old_treasury else None, data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم تحديث الخزينة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في تحديث الخزينة: {str(e)}'}), 500

@app.route('/api/treasuries/<int:treasury_id>', methods=['DELETE'])
@login_required
@admin_required
def api_delete_treasury(treasury_id):
    conn = get_db_connection()
    try:
        # التحقق من وجود معاملات مرتبطة بالخزينة
        transactions_count = conn.execute('SELECT COUNT(*) as count FROM transactions WHERE treasury_id = ?', (treasury_id,)).fetchone()['count']
        
        if transactions_count > 0:
            conn.close()
            return jsonify({'error': 'لا يمكن حذف الخزينة لوجود معاملات مرتبطة بها'}), 400
        
        # الحصول على البيانات للتسجيل
        old_treasury = conn.execute('SELECT * FROM treasuries WHERE id = ?', (treasury_id,)).fetchone()
        
        conn.execute('UPDATE treasuries SET is_active = 0 WHERE id = ?', (treasury_id,))
        conn.commit()
        
        log_activity('حذف خزينة', 'treasuries', treasury_id, dict(old_treasury) if old_treasury else None, None)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم حذف الخزينة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في حذف الخزينة: {str(e)}'}), 500


# APIs للمعاملات
@app.route('/api/transactions')
@login_required
def api_get_transactions():
    conn = get_db_connection()
    
    # معاملات مع تفاصيل إضافية
    transactions = conn.execute('''
        SELECT t.*, 
               tr.name as treasury_name,
               u.full_name as user_name
        FROM transactions t
        LEFT JOIN treasuries tr ON t.treasury_id = tr.id
        LEFT JOIN users u ON t.user_id = u.id
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
            INSERT INTO transactions (type, amount, description, reference, treasury_id, user_id, transaction_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['type'],
            data['amount'],
            data['description'],
            data.get('reference', ''),
            data['treasury_id'],
            session['user_id'],
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

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
@login_required
def api_update_transaction(transaction_id):
    data = request.get_json()
    
    required_fields = ['type', 'amount', 'description', 'treasury_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'الحقل {field} مطلوب'}), 400
    
    conn = get_db_connection()
    
    try:
        # الحصول على البيانات القديمة
        old_transaction = conn.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,)).fetchone()
        
        if not old_transaction:
            conn.close()
            return jsonify({'error': 'المعاملة غير موجودة'}), 404
        
        # إعادة الرصيد القديم
        if old_transaction['type'] == 'income':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance - ? 
                WHERE id = ?
            ''', (old_transaction['amount'], old_transaction['treasury_id']))
        elif old_transaction['type'] == 'expense':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance + ? 
                WHERE id = ?
            ''', (old_transaction['amount'], old_transaction['treasury_id']))
        
        # تحديث المعاملة
        conn.execute('''
            UPDATE transactions 
            SET type = ?, amount = ?, description = ?, reference = ?, treasury_id = ?, transaction_date = ?
            WHERE id = ?
        ''', (
            data['type'],
            data['amount'],
            data['description'],
            data.get('reference', ''),
            data['treasury_id'],
            data.get('transaction_date', datetime.now()),
            transaction_id
        ))
        
        # تطبيق الرصيد الجديد
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
        
        log_activity('تعديل معاملة', 'transactions', transaction_id, dict(old_transaction), data)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم تحديث المعاملة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في تحديث المعاملة: {str(e)}'}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@login_required
def api_delete_transaction(transaction_id):
    conn = get_db_connection()
    
    try:
        # الحصول على بيانات المعاملة
        transaction = conn.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,)).fetchone()
        
        if not transaction:
            conn.close()
            return jsonify({'error': 'المعاملة غير موجودة'}), 404
        
        # إعادة الرصيد
        if transaction['type'] == 'income':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance - ? 
                WHERE id = ?
            ''', (transaction['amount'], transaction['treasury_id']))
        elif transaction['type'] == 'expense':
            conn.execute('''
                UPDATE treasuries 
                SET balance = balance + ? 
                WHERE id = ?
            ''', (transaction['amount'], transaction['treasury_id']))
        
        # حذف المعاملة
        conn.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        conn.commit()
        
        log_activity('حذف معاملة', 'transactions', transaction_id, dict(transaction), None)
        
        conn.close()
        return jsonify({'success': True, 'message': 'تم حذف المعاملة بنجاح'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'خطأ في حذف المعاملة: {str(e)}'}), 500

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
    
    # عدد الخزائن
    treasuries_count = conn.execute('SELECT COUNT(*) as count FROM treasuries WHERE is_active = 1').fetchone()['count']
    
    # عدد المعاملات اليوم
    today = date.today()
    today_transactions = conn.execute('''
        SELECT COUNT(*) as count 
        FROM transactions 
        WHERE DATE(transaction_date) = ?
    ''', (today,)).fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'total_balance': total_balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_profit': total_income - total_expenses,
            'treasuries_count': treasuries_count,
            'today_transactions': today_transactions
        }
    })

if __name__ == '__main__':
    init_database()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)