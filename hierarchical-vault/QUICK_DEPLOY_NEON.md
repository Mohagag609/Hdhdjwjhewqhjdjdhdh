# نشر سريع على Render مع Neon 🚀

## الخطوات السريعة (5 دقائق)

### 1. إعداد قاعدة البيانات
```bash
# تشغيل SQL لإنشاء الجداول
psql 'postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema-neon.sql
```

### 2. رفع الكود إلى GitHub
```bash
git add .
git commit -m "Deploy to Render with Neon"
git push origin main
```

### 3. النشر على Render

#### الطريقة السريعة (render.yaml):
1. اذهب إلى [Render](https://dashboard.render.com)
2. "New +" → "Blueprint"
3. اختر المستودع
4. Render سيقوم بقراءة render.yaml تلقائياً

#### الطريقة اليدوية:

##### الخادم الخلفي:
1. "New +" → "Web Service"
2. اختر المستودع
3. اختر:
   - **Name**: `hierarchical-vault-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. أضف متغيرات البيئة:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech
   DB_PORT=5432
   DB_NAME=neondb
   DB_USER=neondb_owner
   DB_PASSWORD=npg_YKgCwrf10JDV
   DB_SSL=true
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
   ```

##### الواجهة الأمامية:
1. "New +" → "Static Site"
2. اختر المستودع
3. اختر:
   - **Name**: `hierarchical-vault-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. أضف متغيرات البيئة:
   ```
   VITE_API_URL=https://hierarchical-vault-backend.onrender.com/api
   ```

## 🔗 الروابط النهائية
- **الواجهة الأمامية**: `https://hierarchical-vault-frontend.onrender.com`
- **API الخلفي**: `https://hierarchical-vault-backend.onrender.com`
- **بيانات الدخول**: `admin` / `password`

## ⚡ نصائح سريعة
- انتظر حتى يكتمل بناء الخدمات
- تأكد من تشغيل SQL أولاً
- راقب logs في حالة وجود أخطاء

## 🆘 استكشاف الأخطاء
- **خطأ قاعدة البيانات**: تأكد من تشغيل SQL
- **خطأ SSL**: تأكد من DB_SSL=true
- **خطأ CORS**: تأكد من صحة CORS_ORIGIN
- **خطأ 404**: تأكد من صحة VITE_API_URL

## 💰 التكلفة
- **Render**: مجاني
- **Neon**: مجاني

---
**الوقت المطلوب**: 5-10 دقائق