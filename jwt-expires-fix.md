# إصلاح خطأ JWT expiresIn

## 🔍 المشكلة:
```
Registration error: Error: "expiresIn" should be a number of seconds or string representing a timespan
```

## ✅ الحل:

### المشكلة:
- `process.env.JWT_EXPIRES_IN` قد يكون `undefined` أو قيمة غير صحيحة
- JWT يتوقع رقم (ثواني) أو string صحيح (مثل '24h', '7d')

### الحل المطبق:
```javascript
// قبل
{ expiresIn: process.env.JWT_EXPIRES_IN || '24h' }

// بعد
{ expiresIn: '24h' }
```

## 🚀 خطوات الإصلاح:

### 1. **ارفع التحديثات:**
```bash
git add .
git commit -m "Fix JWT expiresIn - use fixed value instead of env variable"
git push origin main
```

### 2. **في Render Dashboard:**
1. **Backend Service**: اضغط **Manual Deploy**
2. **انتظر البناء** (2-3 دقائق)

### 3. **اختبر التسجيل:**
1. افتح: https://treasury-frontend.onrender.com
2. اضغط "إنشاء حساب جديد"
3. أدخل البيانات:
   ```
   Username: admin
   Email: admin@treasury.com
   Password: admin123
   Role: admin
   ```

## 📝 قيم JWT expiresIn الصحيحة:

### String Format:
- `'1h'` - ساعة واحدة
- `'24h'` - 24 ساعة
- `'7d'` - 7 أيام
- `'30d'` - 30 يوم

### Number Format:
- `3600` - 3600 ثانية (ساعة واحدة)
- `86400` - 86400 ثانية (24 ساعة)

## 🔧 الملفات المُحدثة:
- ✅ `backend/routes/auth.js` - إصلاح expiresIn

## 📊 اختبار شامل:

### 1. **اختبار Backend:**
```bash
curl https://treasury-backend-bggr.onrender.com/health
```

### 2. **اختبار التسجيل:**
```bash
curl -X POST https://treasury-backend-bggr.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"testuser2@test.com","password":"test123","role":"user"}'
```

### 3. **اختبار Frontend:**
- افتح: https://treasury-frontend.onrender.com
- جرب إنشاء حساب جديد

## 📝 بيانات اختبار:

### حساب Admin:
```
Username: admin
Email: admin@treasury.com
Password: admin123
Role: admin
```

### حساب User:
```
Username: manager
Email: manager@treasury.com
Password: manager123
Role: user
```

---

**بعد إصلاح JWT expiresIn، إنشاء الحساب سيعمل بشكل صحيح!** ✅