#!/bin/bash

# سكريبت التشغيل السريع مع Neon
echo "🚀 بدء تشغيل نظام خزينة هرمية مع Neon..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود psql
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client غير مثبت. يرجى تثبيت PostgreSQL client أولاً."
    exit 1
fi

echo "✅ تم التحقق من المتطلبات"

# إعداد قاعدة البيانات
echo "📊 إعداد قاعدة البيانات..."
psql 'postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema-neon.sql

if [ $? -eq 0 ]; then
    echo "✅ تم إنشاء قاعدة البيانات بنجاح"
else
    echo "❌ فشل في إنشاء قاعدة البيانات"
    exit 1
fi

# نسخ ملف البيئة
echo "⚙️ إعداد ملف البيئة..."
cp backend/.env.neon backend/.env

# تثبيت تبعيات الخادم الخلفي
echo "🔧 تثبيت تبعيات الخادم الخلفي..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ تم تثبيت تبعيات الخادم الخلفي"
else
    echo "❌ فشل في تثبيت تبعيات الخادم الخلفي"
    exit 1
fi

# تثبيت تبعيات الواجهة الأمامية
echo "🎨 تثبيت تبعيات الواجهة الأمامية..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ تم تثبيت تبعيات الواجهة الأمامية"
else
    echo "❌ فشل في تثبيت تبعيات الواجهة الأمامية"
    exit 1
fi

# تشغيل الخادم الخلفي في الخلفية
echo "🖥️ تشغيل الخادم الخلفي..."
cd ../backend
npm run dev &
BACKEND_PID=$!

# انتظار قليل لبدء الخادم الخلفي
sleep 3

# تشغيل الواجهة الأمامية
echo "🌐 تشغيل الواجهة الأمامية..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 تم تشغيل النظام بنجاح!"
echo ""
echo "📋 معلومات الوصول:"
echo "   🌐 الواجهة الأمامية: http://localhost:3000"
echo "   🔧 API الخلفي: http://localhost:5000"
echo "   👤 اسم المستخدم: admin"
echo "   🔑 كلمة المرور: password"
echo ""
echo "📝 ملاحظات:"
echo "   - تم استخدام قاعدة بيانات Neon"
echo "   - تأكد من تشغيل PostgreSQL client"
echo "   - لإيقاف النظام، اضغط Ctrl+C"
echo ""

# انتظار إشارة الإيقاف
trap "echo '🛑 إيقاف النظام...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait