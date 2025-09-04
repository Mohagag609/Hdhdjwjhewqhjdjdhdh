# نشر سريع على Render 🚀

## الخطوات السريعة

### 1. رفع الكود إلى GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 2. إنشاء قاعدة البيانات
1. اذهب إلى [Render](https://dashboard.render.com)
2. "New +" → "PostgreSQL"
3. اختر:
   - **Name**: `hierarchical-vault-db`
   - **Database**: `hierarchical_vault`
   - **User**: `hierarchical_vault_user`

### 3. إنشاء الخادم الخلفي
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
   DB_HOST=[من قاعدة البيانات]
   DB_PORT=5432
   DB_NAME=hierarchical_vault
   DB_USER=[من قاعدة البيانات]
   DB_PASSWORD=[من قاعدة البيانات]
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
   ```

### 4. إنشاء الواجهة الأمامية
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

### 5. إعداد قاعدة البيانات
1. اذهب إلى قاعدة البيانات
2. "Connect" → "External Connection"
3. شغل محتوى `database/schema-postgresql.sql`

## 🔗 الروابط النهائية
- **الواجهة الأمامية**: `https://hierarchical-vault-frontend.onrender.com`
- **API الخلفي**: `https://hierarchical-vault-backend.onrender.com`
- **بيانات الدخول**: `admin` / `password`

## ⚡ نصائح سريعة
- انتظر حتى يكتمل بناء الخدمات
- تأكد من صحة متغيرات البيئة
- راقب logs في حالة وجود أخطاء

## 🆘 استكشاف الأخطاء
- **خطأ قاعدة البيانات**: تأكد من تشغيل SQL
- **خطأ CORS**: تأكد من صحة CORS_ORIGIN
- **خطأ 404**: تأكد من صحة VITE_API_URL

---
**الوقت المطلوب**: 10-15 دقيقة