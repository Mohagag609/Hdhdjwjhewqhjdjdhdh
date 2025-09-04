#!/bin/bash

echo "🚀 إعداد مشروع نظام الخزنة للنشر على Render"
echo "=============================================="

# التحقق من وجود git
if ! command -v git &> /dev/null; then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً"
    exit 1
fi

# التحقق من حالة git
if [ ! -d ".git" ]; then
    echo "📁 تهيئة مستودع Git..."
    git init
    git add .
    git commit -m "Initial commit - Treasury Management System"
    echo "✅ تم تهيئة مستودع Git"
else
    echo "📝 إضافة التغييرات إلى Git..."
    git add .
    git commit -m "Prepare for Render deployment"
    echo "✅ تم إضافة التغييرات"
fi

echo ""
echo "📋 خطوات النشر التالية:"
echo "1. ارفع المشروع على GitHub:"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. اذهب إلى https://render.com"
echo "3. أنشئ خدمة ويب جديدة"
echo "4. اربط مستودع GitHub"
echo "5. استخدم الإعدادات التالية:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python app.py"
echo ""
echo "✅ المشروع جاهز للنشر على Render!"
echo "📖 راجع ملف DEPLOYMENT.md للتفاصيل الكاملة"