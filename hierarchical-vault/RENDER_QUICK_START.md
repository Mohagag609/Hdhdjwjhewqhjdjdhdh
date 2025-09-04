# 🚀 دليل النشر السريع على Render

## الخطوة 1: إعداد قاعدة البيانات Neon

### 1.1 إنشاء حساب على Neon
1. اذهب إلى [neon.tech](https://neon.tech)
2. سجل حساب جديد
3. أنشئ مشروع جديد
4. احصل على معلومات الاتصال:
   - Host
   - Database Name
   - Username
   - Password
   - Port (عادة 5432)

### 1.2 تشغيل SQL Schema
انسخ محتوى ملف `database/schema-neon.sql` وشغله في Neon Console

## الخطوة 2: النشر على Render

### 2.1 رفع المشروع إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/hierarchical-vault.git
git push -u origin main
```

### 2.2 إنشاء مشروع على Render
1. اذهب إلى [render.com](https://render.com)
2. سجل دخول بحساب GitHub
3. اضغط "New +" → "Blueprint"
4. اختر المستودع من GitHub
5. اضغط "Apply"

### 2.3 تحديث متغيرات البيئة
في Render Dashboard، اذهب إلى Backend Service → Environment:

```
NODE_ENV=production
PORT=10000
DB_HOST=your-neon-host
DB_PORT=5432
DB_NAME=your-neon-database
DB_USER=your-neon-username
DB_PASSWORD=your-neon-password
DB_SSL=true
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### 2.4 تحديث Frontend Environment
في Frontend Service → Environment:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## الخطوة 3: تشغيل المشروع

### 3.1 تشغيل Backend
```bash
cd backend
npm install
npm start
```

### 3.2 تشغيل Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```

## 🔗 روابط مفيدة

- [Neon Console](https://console.neon.tech)
- [Render Dashboard](https://dashboard.render.com)
- [GitHub Repository](https://github.com)

## 📞 الدعم

إذا واجهت أي مشاكل، تحقق من:
1. متغيرات البيئة صحيحة
2. قاعدة البيانات متصلة
3. SSL مفعل
4. CORS مضبوط بشكل صحيح