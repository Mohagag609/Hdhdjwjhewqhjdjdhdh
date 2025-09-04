# دليل النشر - خزينة هرمية

## 🚀 النشر على Render

### المتطلبات
- حساب على Render
- مستودع GitHub
- Node.js 16+

### الخطوات السريعة

#### 1. إعداد المستودع
```bash
# رفع الكود إلى GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. إنشاء قاعدة البيانات على Render
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط "New +" → "PostgreSQL"
3. اختر:
   - **Name**: `hierarchical-vault-db`
   - **Database**: `hierarchical_vault`
   - **User**: `hierarchical_vault_user`
   - **Plan**: `Starter` (مجاني)

#### 3. إنشاء الخادم الخلفي
1. اضغط "New +" → "Web Service"
2. اختر المستودع الخاص بك
3. اختر:
   - **Name**: `hierarchical-vault-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. أضف متغيرات البيئة:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=[من قاعدة البيانات]
   DB_PORT=5432
   DB_NAME=hierarchical_vault
   DB_USER=[من قاعدة البيانات]
   DB_PASSWORD=[من قاعدة البيانات]
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
   ```

#### 4. إنشاء الواجهة الأمامية
1. اضغط "New +" → "Static Site"
2. اختر المستودع الخاص بك
3. اختر:
   - **Name**: `hierarchical-vault-frontend`
   - **Environment**: `Static`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. أضف متغيرات البيئة:
   ```
   VITE_API_URL=https://hierarchical-vault-backend.onrender.com/api
   ```

#### 5. إعداد قاعدة البيانات
1. اذهب إلى قاعدة البيانات
2. اضغط "Connect" → "External Connection"
3. استخدم أي أداة قاعدة بيانات
4. شغل محتوى `database/schema-postgresql.sql`

### 🔗 الروابط النهائية
- **الواجهة الأمامية**: `https://hierarchical-vault-frontend.onrender.com`
- **API الخلفي**: `https://hierarchical-vault-backend.onrender.com`
- **بيانات الدخول**: `admin` / `password`

## 🐳 النشر باستخدام Docker

### الخادم الخلفي
```bash
cd backend
docker build -t hierarchical-vault-backend .
docker run -p 5000:10000 hierarchical-vault-backend
```

### الواجهة الأمامية
```bash
cd frontend
docker build -t hierarchical-vault-frontend .
docker run -p 3000:80 hierarchical-vault-frontend
```

## 🌐 النشر على منصات أخرى

### Heroku
1. إنشاء `Procfile` في الجذر
2. إضافة `heroku-postgresql` addon
3. تحديث متغيرات البيئة

### Vercel
1. ربط المستودع بـ Vercel
2. إعداد متغيرات البيئة
3. استخدام Vercel Postgres

### Railway
1. ربط المستودع بـ Railway
2. إضافة PostgreSQL service
3. تحديث متغيرات البيئة

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة متغيرات البيئة
   - تأكد من تشغيل SQL

2. **خطأ CORS**
   - تأكد من صحة CORS_ORIGIN
   - تأكد من أن الرابط صحيح

3. **خطأ في البناء**
   - تأكد من صحة Root Directory
   - تأكد من وجود package.json

4. **خطأ 404 في API**
   - تأكد من صحة VITE_API_URL
   - تأكد من أن الخادم الخلفي يعمل

## 📊 مراقبة الأداء

- استخدم Render Dashboard لمراقبة الأداء
- راقب logs للخادم الخلفي
- راقب استخدام قاعدة البيانات

## 🔄 التحديثات

للتحديث:
1. ادفع التغييرات إلى GitHub
2. Render سيقوم بإعادة البناء تلقائياً
3. انتظر حتى يكتمل البناء

## 💰 التكلفة

- **Starter Plan**: مجاني مع قيود
- **PostgreSQL**: مجاني مع قيود
- **Static Site**: مجاني

## 📞 الدعم

- Render Documentation: https://render.com/docs
- Render Support: https://render.com/support

---

**ملاحظة**: تأكد من تحديث جميع الروابط في الكود لتشير إلى URLs الجديدة على Render.