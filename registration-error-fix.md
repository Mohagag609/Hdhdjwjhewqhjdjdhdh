# إصلاح خطأ إنشاء الحساب

## 🔍 المشكلة:
```
خطأ في إنشاء الحساب
فشل في إنشاء الحساب
```

## ✅ الحلول المطبقة:

### 1. **إصلاح JWT Expiration:**
```javascript
// قبل
{ expiresIn: process.env.JWT_EXPIRES_IN }

// بعد
{ expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
```

### 2. **تحسين معالجة الأخطاء:**
```javascript
} catch (error) {
  console.error('Registration error:', error);
  res.status(500).json({
    success: false,
    message: 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## 🚀 خطوات الإصلاح:

### 1. **ارفع التحديثات:**
```bash
git add .
git commit -m "Fix registration error - JWT expiration and error handling"
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

## 🔧 استكشاف الأخطاء:

### إذا استمر الخطأ:

#### 1. **تحقق من Logs في Render:**
- اذهب إلى Backend Service
- اضغط على **Logs**
- ابحث عن رسائل الخطأ

#### 2. **تحقق من قاعدة البيانات:**
```bash
# اختبار الاتصال
curl https://treasury-backend-bggr.onrender.com/health
```

#### 3. **تحقق من متغيرات البيئة:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_l7ABpvfRoE6b@ep-empty-snow-adpqm6pu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secret-key
```

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

## 🔍 مشاكل شائعة:

### 1. **خطأ قاعدة البيانات:**
- تحقق من `DATABASE_URL`
- تأكد من اتصال قاعدة البيانات

### 2. **خطأ JWT:**
- تحقق من `JWT_SECRET`
- تأكد من صحة التوقيع

### 3. **خطأ التحقق:**
- تأكد من صحة البيانات المدخلة
- تحقق من قواعد التحقق

---

**بعد إعادة التشغيل، إنشاء الحساب سيعمل بشكل صحيح!** ✅