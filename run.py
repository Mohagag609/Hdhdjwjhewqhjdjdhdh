#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ملف تشغيل نظام الخزنة الاحترافي
Treasury Management System Runner
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_requirements():
    """التحقق من متطلبات النظام"""
    print("🔍 التحقق من متطلبات النظام...")
    
    # التحقق من Python
    if sys.version_info < (3, 7):
        print("❌ يتطلب Python 3.7 أو أحدث")
        return False
    
    print(f"✅ Python {sys.version.split()[0]}")
    
    # التحقق من pip
    try:
        import pip
        print("✅ pip متوفر")
    except ImportError:
        print("❌ pip غير متوفر")
        return False
    
    return True

def install_requirements():
    """تثبيت المكتبات المطلوبة"""
    print("📦 تثبيت المكتبات المطلوبة...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ تم تثبيت المكتبات بنجاح")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ خطأ في تثبيت المكتبات: {e}")
        return False

def create_database_directory():
    """إنشاء مجلد قاعدة البيانات"""
    db_dir = Path("database")
    if not db_dir.exists():
        db_dir.mkdir()
        print("✅ تم إنشاء مجلد قاعدة البيانات")
    else:
        print("✅ مجلد قاعدة البيانات موجود")

def run_application():
    """تشغيل التطبيق"""
    print("🚀 تشغيل نظام الخزنة الاحترافي...")
    print("📱 سيفتح المتصفح تلقائياً على العنوان: http://localhost:5000")
    print("⏹️  لإيقاف الخادم، اضغط Ctrl+C")
    print("-" * 50)
    
    # فتح المتصفح بعد ثانيتين
    def open_browser():
        time.sleep(2)
        webbrowser.open('http://localhost:5000')
    
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # تشغيل التطبيق
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 تم إيقاف الخادم")
    except Exception as e:
        print(f"❌ خطأ في تشغيل التطبيق: {e}")

def main():
    """الدالة الرئيسية"""
    print("=" * 60)
    print("🏦 نظام الخزنة الاحترافي - Professional Treasury System")
    print("=" * 60)
    
    # التحقق من المتطلبات
    if not check_requirements():
        print("❌ فشل في التحقق من المتطلبات")
        return
    
    # تثبيت المكتبات
    if not install_requirements():
        print("❌ فشل في تثبيت المكتبات")
        return
    
    # إنشاء مجلد قاعدة البيانات
    create_database_directory()
    
    # تشغيل التطبيق
    run_application()

if __name__ == "__main__":
    main()