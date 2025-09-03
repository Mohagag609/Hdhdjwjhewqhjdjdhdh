# دليل Render Blueprint لنظام إدارة الخزينة

## 📋 نظرة عامة

تم إنشاء Render Blueprint كامل لنظام إدارة الخزينة الاحترافي. هذا الملف يسمح لك بنشر التطبيق كاملاً على Render بنقرة واحدة.

## 🏗️ هيكل Blueprint

### الخدمات المُعرّفة:

#### 1. الخادم الخلفي (treasury-backend)
- **النوع**: Web Service
- **البيئة**: Node.js
- **المنفذ**: 10000
- **Health Check**: `/health`
- **البناء**: `cd backend && npm ci --only=production`
- **التشغيل**: `cd backend && npm start`

#### 2. الواجهة الأمامية (treasury-frontend)
- **النوع**: Static Site
- **البيئة**: Static
- **البناء**: `cd frontend && npm ci && npm run build`
- **المسار**: `./frontend/build`

#### 3. قاعدة البيانات (treasury-postgres)
- **النوع**: Managed PostgreSQL
- **الخطة**: Free
- **الاسم**: treasury_db
- **المستخدم**: treasury_user

## 🔧 المتغيرات البيئية

### الخادم الخلفي:
- `NODE_ENV`: production
- `PORT`: 10000
- `DATABASE_URL`: من قاعدة البيانات
- `JWT_SECRET`: مُولد تلقائياً
- `FRONTEND_URL`: من الواجهة الأمامية
- `RATE_LIMIT_WINDOW_MS`: 900000
- `RATE_LIMIT_MAX_REQUESTS`: 100

### الواجهة الأمامية:
- `REACT_APP_API_URL`: من الخادم الخلفي
- `REACT_APP_APP_NAME`: Treasury Management System
- `REACT_APP_VERSION`: 1.0.0

## 🚀 خطوات النشر

### 1. إعداد المستودع
```bash
# تأكد من وجود جميع الملفات
git add .
git commit -m "Add Render Blueprint"
git push origin main
```

### 2. النشر على Render
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط "New +" → "Blueprint"
3. اربط مستودع Git
4. اختر `render.yaml`
5. اضغط "Apply"

### 3. مراقبة النشر
- ستظهر الخدمات الثلاث في Dashboard
- انتظر حتى تكتمل عملية البناء
- تحقق من Health Check

## 📊 مراقبة الأداء

### Health Checks:
- **Backend**: `https://treasury-backend.onrender.com/health`
- **Frontend**: `https://treasury-frontend.onrender.com`

### Logs:
- متاحة في Render Dashboard
- مراقبة الأخطاء والأداء
- تتبع الطلبات

## 🔒 الأمان

### الميزات المُفعلة:
- HTTPS تلقائي
- Rate Limiting
- CORS مُعد
- Helmet.js للأمان
- JWT للمصادقة

### متغيرات البيئة:
- مشفرة في Render
- غير مرئية في الكود
- مُدارة تلقائياً

## 💰 التكلفة

### الخطة المجانية:
- **Backend**: 750 ساعة/شهر
- **Frontend**: غير محدود
- **Database**: 1GB تخزين

### الخطة المدفوعة:
- **Backend**: $7/شهر
- **Database**: $7/شهر
- **Frontend**: مجاني

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

#### 1. فشل البناء:
```bash
# تحقق من package.json
# تأكد من وجود package-lock.json
```

#### 2. خطأ قاعدة البيانات:
```bash
# تحقق من DATABASE_URL
# تأكد من اتصال قاعدة البيانات
```

#### 3. مشاكل CORS:
```bash
# تحقق من FRONTEND_URL
# تأكد من إعدادات CORS
```

### سجلات الأخطاء:
```bash
# في Render Dashboard
Services → treasury-backend → Logs
```

## 🔄 التحديثات

### تحديث التطبيق:
```bash
git add .
git commit -m "Update application"
git push origin main
# سيتم النشر تلقائياً
```

### تحديث Blueprint:
```bash
# عدّل render.yaml
git add render.yaml
git commit -m "Update Blueprint"
git push origin main
```

## 📈 التوسع

### Auto-scaling:
- متاح في الخطط المدفوعة
- تلقائي حسب الطلب
- Load balancing

### CDN:
- للواجهة الأمامية
- تحسين الأداء
- توزيع جغرافي

## 🎯 أفضل الممارسات

### 1. الأمان:
- استخدم متغيرات البيئة
- فعّل HTTPS
- راقب السجلات

### 2. الأداء:
- استخدم CDN
- فعّل Caching
- راقب الاستخدام

### 3. المراقبة:
- راقب Health Checks
- تتبع الأخطاء
- مراقبة الأداء

---

**ملاحظة**: هذا Blueprint مُحسّن للإنتاج ويشمل جميع الإعدادات المطلوبة لنشر نظام إدارة الخزينة بنجاح.