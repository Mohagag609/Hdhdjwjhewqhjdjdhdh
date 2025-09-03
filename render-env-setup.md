# إعداد متغيرات البيئة في Render

## 🔧 إعداد متغيرات البيئة للـ Frontend

### المشكلة:
```
{
  "success": false,
  "message": "المسار غير موجود"
}
```

### السبب:
- `REACT_APP_API_URL` غير مُعد في Render
- Frontend يحاول الاتصال بـ `http://localhost:3001/api`
- Backend غير متاح على localhost

### الحل:

#### 1. في Render Dashboard - Frontend Service:
اذهب إلى **Environment Variables** وأضف:

```
REACT_APP_API_URL=https://treasury-backend.onrender.com/api
REACT_APP_APP_NAME=Treasury Management System
REACT_APP_VERSION=1.0.0
```

#### 2. في Render Dashboard - Backend Service:
تأكد من وجود:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_l7ABpvfRoE6b@ep-empty-snow-adpqm6pu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### خطوات الإعداد:

#### 1. Frontend Service:
1. اذهب إلى Render Dashboard
2. اختر Frontend Service
3. اضغط على **Environment**
4. أضف المتغيرات:
   - `REACT_APP_API_URL` = `https://treasury-backend.onrender.com/api`
   - `REACT_APP_APP_NAME` = `Treasury Management System`
   - `REACT_APP_VERSION` = `1.0.0`

#### 2. Backend Service:
1. اذهب إلى Render Dashboard
2. اختر Backend Service
3. اضغط على **Environment**
4. تأكد من وجود جميع المتغيرات المطلوبة

### اختبار الاتصال:

#### 1. تحقق من Backend:
```bash
curl https://treasury-backend.onrender.com/health
```

#### 2. تحقق من Frontend:
```bash
curl https://treasury-frontend.onrender.com
```

### الملفات المُحدثة:
- ✅ `frontend/.env` - للمطور المحلي

### ملاحظات مهمة:
- **REACT_APP_API_URL**: يجب أن يشير إلى Backend URL
- **HTTPS**: Render يستخدم HTTPS تلقائياً
- **CORS**: Backend مُعد للسماح بـ Frontend URL

## 🚀 بعد الإعداد:

1. **أعد تشغيل الخدمات** في Render
2. **انتظر البناء** (2-3 دقائق)
3. **اختبر التطبيق** في المتصفح

### روابط التطبيق:
- **Frontend**: `https://treasury-frontend.onrender.com`
- **Backend**: `https://treasury-backend.onrender.com`
- **Health Check**: `https://treasury-backend.onrender.com/health`