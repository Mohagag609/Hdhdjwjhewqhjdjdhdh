# 🚀 خطوات النشر على Render - دليل شامل

## الخطوة 1: إعداد قاعدة البيانات Neon

### 1.1 إنشاء حساب على Neon
1. اذهب إلى [neon.tech](https://neon.tech)
2. اضغط "Sign Up" وسجل حساب جديد
3. اضغط "Create Project"
4. اختر اسم للمشروع (مثل: hierarchical-vault)
5. اختر المنطقة (أقرب منطقة لك)
6. اضغط "Create Project"

### 1.2 الحصول على معلومات الاتصال
بعد إنشاء المشروع، ستحصل على:
- **Host**: مثل `ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech`
- **Database**: مثل `neondb`
- **Username**: مثل `neondb_owner`
- **Password**: مثل `npg_YKgCwrf10JDV`
- **Port**: `5432`

### 1.3 تشغيل Schema
1. اذهب إلى "SQL Editor" في Neon Console
2. انسخ محتوى ملف `database/schema-neon.sql`
3. الصق الكود واضغط "Run"

## الخطوة 2: رفع المشروع إلى GitHub

### 2.1 إنشاء مستودع جديد
1. اذهب إلى [github.com](https://github.com)
2. اضغط "New repository"
3. اختر اسم: `hierarchical-vault`
4. اختر "Public"
5. اضغط "Create repository"

### 2.2 رفع الكود
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/hierarchical-vault.git
git push -u origin main
```

## الخطوة 3: النشر على Render

### 3.1 إنشاء حساب على Render
1. اذهب إلى [render.com](https://render.com)
2. اضغط "Get Started for Free"
3. سجل دخول بحساب GitHub

### 3.2 إنشاء مشروع جديد
1. اضغط "New +"
2. اختر "Blueprint"
3. اختر المستودع `hierarchical-vault`
4. اضغط "Apply"

### 3.3 تحديث متغيرات البيئة
في Render Dashboard:

#### Backend Service Environment:
```
NODE_ENV=production
PORT=10000
DB_HOST=YOUR_NEON_HOST_HERE
DB_PORT=5432
DB_NAME=YOUR_NEON_DATABASE_HERE
DB_USER=YOUR_NEON_USERNAME_HERE
DB_PASSWORD=YOUR_NEON_PASSWORD_HERE
DB_SSL=true
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
```

#### Frontend Service Environment:
```
VITE_API_URL=https://hierarchical-vault-backend.onrender.com/api
```

## الخطوة 4: تشغيل المشروع

### 4.1 تشغيل Backend
1. اذهب إلى Backend Service في Render
2. اضغط "Manual Deploy" → "Deploy latest commit"
3. انتظر حتى يكتمل البناء

### 4.2 تشغيل Frontend
1. اذهب إلى Frontend Service في Render
2. اضغط "Manual Deploy" → "Deploy latest commit"
3. انتظر حتى يكتمل البناء

## الخطوة 5: اختبار المشروع

### 5.1 اختبار Backend
- اذهب إلى Backend URL
- يجب أن ترى: `{"message":"Hierarchical Vault API"}`

### 5.2 اختبار Frontend
- اذهب إلى Frontend URL
- يجب أن ترى صفحة تسجيل الدخول

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ في قاعدة البيانات**: تأكد من صحة معلومات Neon
2. **خطأ CORS**: تأكد من صحة CORS_ORIGIN
3. **خطأ في البناء**: تحقق من logs في Render

### فحص Logs:
1. اذهب إلى Service في Render
2. اضغط "Logs"
3. ابحث عن الأخطاء

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من متغيرات البيئة
2. تأكد من اتصال قاعدة البيانات
3. راجع logs في Render
4. تأكد من صحة URLs

## 🎉 تهانينا!

بعد اكتمال النشر، ستحصل على:
- Backend URL: `https://hierarchical-vault-backend.onrender.com`
- Frontend URL: `https://hierarchical-vault-frontend.onrender.com`

يمكنك الآن استخدام التطبيق من أي مكان في العالم! 🌍