# إعداد قاعدة بيانات Neon 🚀

## الخطوات السريعة

### 1. تشغيل سكريبت الإعداد
```bash
./setup-neon.sh
```

### 2. تشغيل المشروع
```bash
# الخادم الخلفي
cd backend
npm install
npm run dev

# الواجهة الأمامية (في terminal جديد)
cd frontend
npm install
npm run dev
```

## 🔗 بيانات الدخول
- **اسم المستخدم**: admin
- **كلمة المرور**: password

## 🌐 الروابط
- **الخادم الخلفي**: http://localhost:5000
- **الواجهة الأمامية**: http://localhost:3000

## 📊 إعداد قاعدة البيانات يدوياً

إذا كنت تريد إعداد قاعدة البيانات يدوياً:

```bash
# تشغيل SQL
psql 'postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema-neon.sql
```

## ⚙️ متغيرات البيئة

تم إعداد الملفات التالية:
- `backend/.env.neon` - إعدادات Neon
- `backend/.env` - ملف البيئة النشط

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة رابط قاعدة البيانات
   - تأكد من تشغيل SQL

2. **خطأ SSL**
   - تأكد من تفعيل SSL في إعدادات قاعدة البيانات

3. **خطأ في الصلاحيات**
   - تأكد من صحة اسم المستخدم وكلمة المرور

## 📞 الدعم

- Neon Documentation: https://neon.tech/docs
- Neon Support: https://neon.tech/support

---

**ملاحظة**: تأكد من تثبيت PostgreSQL client tools قبل التشغيل.