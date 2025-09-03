# نشر نظام إدارة الخزينة على Render

## 🚀 النشر باستخدام Render Blueprint

### المتطلبات
- حساب على [Render.com](https://render.com)
- مستودع Git (GitHub, GitLab, أو Bitbucket)

### خطوات النشر

#### 1. رفع الكود إلى Git
```bash
git add .
git commit -m "Add Render Blueprint configuration"
git push origin main
```

#### 2. النشر على Render
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط على "New +" ثم اختر "Blueprint"
3. اربط مستودع Git الخاص بك
4. اختر `render.yaml` كملف Blueprint
5. اضغط "Apply"

#### 3. إعدادات البيئة
سيتم إنشاء المتغيرات التالية تلقائياً:
- `DATABASE_URL`: رابط قاعدة البيانات
- `JWT_SECRET`: مفتاح تشفير JWT
- `REACT_APP_API_URL`: رابط API للواجهة الأمامية

### 🔧 إعدادات الخدمات

#### قاعدة البيانات (PostgreSQL)
- **النوع**: Managed PostgreSQL
- **الخطة**: Free (مجانية)
- **الاسم**: treasury-postgres

#### الخادم الخلفي (Backend)
- **النوع**: Web Service
- **البيئة**: Node.js
- **الخطة**: Free (مجانية)
- **الاسم**: treasury-backend
- **المنفذ**: 10000

#### الواجهة الأمامية (Frontend)
- **النوع**: Static Site
- **البيئة**: Static
- **الخطة**: Free (مجانية)
- **الاسم**: treasury-frontend

### 📊 مراقبة الأداء
- **Health Check**: `/health`
- **Logs**: متاحة في Render Dashboard
- **Metrics**: مراقبة الأداء والاستخدام

### 🔒 الأمان
- HTTPS مفعل تلقائياً
- متغيرات البيئة مشفرة
- Rate Limiting مفعل
- CORS مُعد بشكل صحيح

### 💰 التكلفة
- **الخطة المجانية**: مناسبة للتطوير والاختبار
- **الخطة المدفوعة**: للاستخدام الإنتاجي

### 🛠️ استكشاف الأخطاء

#### مشاكل شائعة:
1. **فشل البناء**: تحقق من `package.json` و `package-lock.json`
2. **خطأ قاعدة البيانات**: تأكد من `DATABASE_URL`
3. **مشاكل CORS**: تحقق من `FRONTEND_URL`

#### سجلات الأخطاء:
```bash
# في Render Dashboard
Services → treasury-backend → Logs
```

### 📈 التوسع
- **Auto-scaling**: متاح في الخطط المدفوعة
- **Load Balancing**: تلقائي
- **CDN**: للواجهة الأمامية

### 🔄 التحديثات
```bash
git add .
git commit -m "Update application"
git push origin main
# سيتم النشر تلقائياً
```

---

**ملاحظة**: تأكد من تحديث `render.yaml` عند إضافة خدمات جديدة أو تغيير الإعدادات.