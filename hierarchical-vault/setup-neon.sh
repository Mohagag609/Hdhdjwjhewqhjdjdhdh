#!/bin/bash

# سكريبت إعداد قاعدة بيانات Neon
echo "🚀 إعداد قاعدة بيانات Neon..."

# متغيرات قاعدة البيانات
DB_URL="postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# تشغيل SQL لإنشاء الجداول
echo "📊 إنشاء الجداول..."
psql "$DB_URL" -f database/schema-neon.sql

if [ $? -eq 0 ]; then
    echo "✅ تم إنشاء قاعدة البيانات بنجاح"
else
    echo "❌ فشل في إنشاء قاعدة البيانات"
    exit 1
fi

# نسخ ملف البيئة
echo "⚙️ إعداد ملف البيئة..."
cp backend/.env.neon backend/.env

echo ""
echo "🎉 تم الإعداد بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. تشغيل الخادم الخلفي: cd backend && npm install && npm run dev"
echo "2. تشغيل الواجهة الأمامية: cd frontend && npm install && npm run dev"
echo ""
echo "🔗 بيانات الدخول:"
echo "   👤 اسم المستخدم: admin"
echo "   🔑 كلمة المرور: password"
echo ""
echo "🌐 الروابط:"
echo "   🖥️ الخادم الخلفي: http://localhost:5000"
echo "   🌐 الواجهة الأمامية: http://localhost:3000"