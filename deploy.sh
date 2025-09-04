#!/bin/bash

echo "🚀 إعداد مشروع نظام الخزنة الاحترافي المتكامل للنشر"
echo "=================================================="

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
    git commit -m "Initial commit - Professional Treasury Management System"
    echo "✅ تم تهيئة مستودع Git"
else
    echo "📝 إضافة التغييرات إلى Git..."
    git add .
    git commit -m "Professional Treasury Management System - Ready for deployment"
    echo "✅ تم إضافة التغييرات"
fi

echo ""
echo "🎯 نظام الخزنة الاحترافي المتكامل"
echo "================================="
echo ""
echo "📋 المميزات الرئيسية:"
echo "🏦 نظام خزنة هرمي متقدم"
echo "👥 إدارة المستخدمين والأدوار"
echo "💰 إدارة المعاملات المالية"
echo "👨‍💼 إدارة العملاء والموردين"
echo "📦 إدارة المنتجات والمخزون"
echo "🧾 نظام الفواتير المتكامل"
echo "📊 التقارير والإحصائيات"
echo "🔔 نظام الإشعارات"
echo "🛡️ الأمان والحماية"
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
echo "6. بيانات تسجيل الدخول:"
echo "   - اسم المستخدم: admin"
echo "   - كلمة المرور: password"
echo ""
echo "✨ المميزات المتقدمة:"
echo "📈 تحليلات متقدمة ومؤشرات الأداء"
echo "🔄 تكامل مع الأنظمة الخارجية"
echo "🎨 تخصيص الواجهة والإعدادات"
echo "📱 متوافق مع جميع الأجهزة"
echo "🔒 أمان وحماية متقدمة"
echo ""
echo "✅ المشروع جاهز للنشر على Render!"
echo "📖 راجع ملف DEPLOYMENT.md للتفاصيل الكاملة"
echo ""
echo "🎉 نظام الخزنة الاحترافي المتكامل - أكثر من مجرد نظام خزنة!"