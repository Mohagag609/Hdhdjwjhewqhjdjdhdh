# نشر على Render مع Neon 🚀

## الخطوات السريعة

### 1. إعداد قاعدة البيانات Neon
1. اذهب إلى [Neon Console](https://console.neon.tech)
2. أنشئ مشروع جديد
3. انسخ رابط قاعدة البيانات

### 2. إعداد قاعدة البيانات
```bash
# تشغيل SQL لإنشاء الجداول
psql 'postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema-neon.sql
```

### 3. رفع الكود إلى GitHub
```bash
git add .
git commit -m "Deploy to Render with Neon"
git push origin main
```

### 4. النشر على Render

#### الطريقة الأولى: استخدام render.yaml
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط "New +" → "Blueprint"
3. اختر المستودع الخاص بك
4. Render سيقوم بقراءة render.yaml تلقائياً

#### الطريقة الثانية: النشر اليدوي

##### إنشاء الخادم الخلفي:
1. "New +" → "Web Service"
2. اختر المستودع
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

##### إنشاء الواجهة الأمامية:
1. "New +" → "Static Site"
2. اختر المستودع
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

## 🔗 الروابط النهائية
- **الواجهة الأمامية**: `https://hierarchical-vault-frontend.onrender.com`
- **API الخلفي**: `https://hierarchical-vault-backend.onrender.com`
- **بيانات الدخول**: `admin` / `password`

## ⚡ المميزات
- ✅ قاعدة بيانات Neon مجانية
- ✅ SSL تلقائي
- ✅ إعادة البناء التلقائي
- ✅ مراقبة الأداء
- ✅ لا حاجة لإعداد قاعدة بيانات منفصلة

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة متغيرات البيئة
   - تأكد من تشغيل SQL

2. **خطأ SSL**
   - تأكد من تفعيل DB_SSL=true

3. **خطأ CORS**
   - تأكد من صحة CORS_ORIGIN

4. **خطأ في البناء**
   - تأكد من صحة Root Directory

## 📊 مراقبة الأداء
- استخدم Render Dashboard لمراقبة الأداء
- راقب logs للخادم الخلفي
- راقب استخدام قاعدة البيانات في Neon

## 🔄 التحديثات
للتحديث:
1. ادفع التغييرات إلى GitHub
2. Render سيقوم بإعادة البناء تلقائياً
3. انتظر حتى يكتمل البناء

## 💰 التكلفة
- **Render Web Service**: مجاني مع قيود
- **Render Static Site**: مجاني
- **Neon Database**: مجاني مع قيود

## 📞 الدعم
- Render Documentation: https://render.com/docs
- Neon Documentation: https://neon.tech/docs
- Render Support: https://render.com/support
- Neon Support: https://neon.tech/support

---

**ملاحظة**: تأكد من تحديث JWT_SECRET في متغيرات البيئة.