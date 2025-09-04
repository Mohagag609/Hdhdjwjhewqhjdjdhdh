# نشر نظام خزينة هرمية على Render

## 🚀 خطوات النشر على Render

### 1. إعداد المستودع

1. ارفع الكود إلى GitHub
2. تأكد من وجود جميع الملفات المطلوبة

### 2. إنشاء قاعدة البيانات

1. اذهب إلى Render Dashboard
2. اضغط "New +" → "PostgreSQL"
3. اختر:
   - **Name**: `hierarchical-vault-db`
   - **Database**: `hierarchical_vault`
   - **User**: `hierarchical_vault_user`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Starter`

4. بعد إنشاء قاعدة البيانات، اذهب إلى "Connect" وانسخ:
   - **External Database URL**
   - **Internal Database URL**

### 3. إنشاء الخادم الخلفي

1. اذهب إلى Render Dashboard
2. اضغط "New +" → "Web Service"
3. اختر المستودع الخاص بك
4. اختر:
   - **Name**: `hierarchical-vault-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. في قسم "Environment Variables"، أضف:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=[من قاعدة البيانات]
   DB_PORT=5432
   DB_NAME=hierarchical_vault
   DB_USER=[من قاعدة البيانات]
   DB_PASSWORD=[من قاعدة البيانات]
   JWT_SECRET=[مفتاح سري قوي]
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
   ```

6. اضغط "Create Web Service"

### 4. إنشاء الواجهة الأمامية

1. اذهب إلى Render Dashboard
2. اضغط "New +" → "Static Site"
3. اختر المستودع الخاص بك
4. اختر:
   - **Name**: `hierarchical-vault-frontend`
   - **Environment**: `Static`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. في قسم "Environment Variables"، أضف:
   ```
   VITE_API_URL=https://hierarchical-vault-backend.onrender.com/api
   ```

6. اضغط "Create Static Site"

### 5. إعداد قاعدة البيانات

بعد إنشاء الخادم الخلفي، ستحتاج إلى تشغيل SQL لإنشاء الجداول:

1. اذهب إلى قاعدة البيانات في Render
2. اضغط "Connect" → "External Connection"
3. استخدم أي أداة مثل pgAdmin أو DBeaver
4. شغل محتوى ملف `database/schema-postgresql.sql`

### 6. اختبار النشر

1. انتظر حتى يكتمل بناء الخدمات
2. اذهب إلى رابط الواجهة الأمامية
3. جرب تسجيل الدخول:
   - **Username**: `admin`
   - **Password**: `password`

## 🔧 إعدادات مهمة

### ملفات مطلوبة في الجذر:
- `render.yaml` - إعدادات Render
- `package.json` - إعدادات المشروع الرئيسي

### متغيرات البيئة المطلوبة:

#### للخادم الخلفي:
```env
NODE_ENV=production
PORT=10000
DB_HOST=[من Render]
DB_PORT=5432
DB_NAME=hierarchical_vault
DB_USER=[من Render]
DB_PASSWORD=[من Render]
JWT_SECRET=[مفتاح سري قوي]
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://hierarchical-vault-frontend.onrender.com
```

#### للواجهة الأمامية:
```env
VITE_API_URL=https://hierarchical-vault-backend.onrender.com/api
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة متغيرات البيئة
   - تأكد من تشغيل SQL لإنشاء الجداول

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