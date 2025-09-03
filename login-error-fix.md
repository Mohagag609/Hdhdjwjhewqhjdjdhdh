# إصلاح خطأ تسجيل الدخول

## 🔍 المشكلة:
```
خطأ في تسجيل الدخول
فشل في تسجيل الدخول
```

## ✅ الحلول:

### 1. **إصلاح CORS في Backend:**
تم تحديث `backend/server.js` ليدعم Frontend URL:

```javascript
// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://treasury-frontend.onrender.com'  // ✅ إضافة جديدة
  ],
  credentials: true
}));
```

### 2. **إعداد متغيرات البيئة في Render:**

#### Frontend Service:
```
REACT_APP_API_URL=https://treasury-backend-bggr.onrender.com/api
REACT_APP_APP_NAME=Treasury Management System
REACT_APP_VERSION=1.0.0
```

#### Backend Service:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_l7ABpvfRoE6b@ep-empty-snow-adpqm6pu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secret-key
FRONTEND_URL=https://treasury-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 خطوات الإصلاح:

### 1. **ارفع التحديثات:**
```bash
git add .
git commit -m "Fix CORS for Render deployment"
git push origin main
```

### 2. **في Render Dashboard:**
1. **Backend Service**: أعد التشغيل (Manual Deploy)
2. **Frontend Service**: أعد التشغيل (Manual Deploy)
3. **انتظر البناء** (2-3 دقائق)

### 3. **تحقق من الإعدادات:**
- تأكد من وجود جميع متغيرات البيئة
- تأكد من أن CORS يدعم Frontend URL

## 🔍 اختبار الاتصال:

### Backend Health Check:
```bash
curl https://treasury-backend-bggr.onrender.com/health
```

### Frontend:
- افتح: https://treasury-frontend.onrender.com
- جرب تسجيل الدخول

## 📝 بيانات تسجيل الدخول:

### إنشاء حساب جديد:
```
Username: admin
Email: admin@treasury.com
Password: admin123
Role: admin
```

### أو:
```
Username: manager
Email: manager@treasury.com
Password: manager123
Role: user
```

## 🔧 استكشاف الأخطاء:

### إذا استمر الخطأ:
1. **تحقق من Console** في المتصفح (F12)
2. **تحقق من Network** في Developer Tools
3. **تحقق من Logs** في Render Dashboard

### مشاكل شائعة:
- **CORS Error**: تم إصلاحه
- **Network Error**: تحقق من متغيرات البيئة
- **404 Error**: تحقق من API URL

---

**بعد إعادة التشغيل، تسجيل الدخول سيعمل بشكل صحيح!** ✅