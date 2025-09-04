#!/bin/bash

# سكريبت تشغيل نظام خزينة هرمية
echo "🚀 بدء تشغيل نظام خزينة هرمية..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL غير مثبت. يرجى تثبيت MySQL أولاً."
    exit 1
fi

echo "✅ تم التحقق من المتطلبات"

# إعداد قاعدة البيانات
echo "📊 إعداد قاعدة البيانات..."
mysql -u root -p < database/schema.sql
if [ $? -eq 0 ]; then
    echo "✅ تم إنشاء قاعدة البيانات بنجاح"
else
    echo "❌ فشل في إنشاء قاعدة البيانات"
    exit 1
fi

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
echo "   - تأكد من تشغيل MySQL"
echo "   - تأكد من تحديث إعدادات قاعدة البيانات في backend/.env"
echo "   - لإيقاف النظام، اضغط Ctrl+C"
echo ""

# انتظار إشارة الإيقاف
trap "echo '🛑 إيقاف النظام...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait