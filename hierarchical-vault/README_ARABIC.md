# 🏦 برنامج الخزينة الهرمية

## 📋 نظرة عامة
برنامج شامل لإدارة الأموال والمشاريع مع نظام خزائن هرمية متعددة المستويات.

## ✨ المميزات
- 🔐 نظام تسجيل دخول آمن
- 🏗️ إدارة الخزائن الرئيسية والفرعية
- 📊 إدارة المشاريع المالية
- 📈 تقارير مالية مفصلة
- 👥 إدارة المستخدمين والأدوار
- 📱 واجهة مستخدم عربية حديثة

## 🚀 النشر السريع على Render

### 1. إعداد قاعدة البيانات
1. اذهب إلى [neon.tech](https://neon.tech) وأنشئ حساب
2. أنشئ مشروع جديد
3. انسخ معلومات الاتصال (Host, Database, Username, Password)
4. شغل ملف `database/schema-neon.sql` في Neon Console

### 2. رفع المشروع
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/hierarchical-vault.git
git push -u origin main
```

### 3. النشر على Render
1. اذهب إلى [render.com](https://render.com)
2. اضغط "New +" → "Blueprint"
3. اختر المستودع
4. حدث متغيرات البيئة:
   - `DB_HOST`: معلومات Neon
   - `DB_NAME`: اسم قاعدة البيانات
   - `DB_USER`: اسم المستخدم
   - `DB_PASSWORD`: كلمة المرور
   - `DB_SSL`: true

## 📁 هيكل المشروع
```
hierarchical-vault/
├── backend/          # الخادم الخلفي
├── frontend/         # الواجهة الأمامية
├── database/         # ملفات قاعدة البيانات
├── render.yaml       # إعدادات Render
└── README.md         # هذا الملف
```

## 🛠️ التقنيات المستخدمة
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **Deployment**: Render

## 📖 الدليل الكامل
- [خطوات النشر على Render](خطوات_النشر_على_Render.md)
- [دليل النشر السريع](RENDER_QUICK_START.md)
- [إعداد Neon](NEON_SETUP.md)

## 🎯 البدء السريع
1. اتبع [خطوات النشر على Render](خطوات_النشر_على_Render.md)
2. انتظر اكتمال النشر
3. اذهب إلى Frontend URL
4. سجل دخول جديد

## 🔧 استكشاف الأخطاء
- تحقق من متغيرات البيئة
- راجع logs في Render
- تأكد من اتصال قاعدة البيانات

## 📞 الدعم
إذا واجهت مشاكل، راجع:
- [دليل استكشاف الأخطاء](خطوات_النشر_على_Render.md#استكشاف-الأخطاء)
- Logs في Render Dashboard
- متغيرات البيئة

---
**ملاحظة**: تأكد من تحديث جميع متغيرات البيئة بمعلومات Neon الصحيحة قبل النشر!