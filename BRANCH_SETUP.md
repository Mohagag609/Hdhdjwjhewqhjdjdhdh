# 🌿 إرشادات إنشاء فرع جديد على مستودع موجود

## خطوات ربط المستودع الحالي بمستودع GitHub موجود:

### 1. الحصول على رابط المستودع
- اذهب إلى مستودعك على GitHub
- اضغط على زر "Code" الأخضر
- انسخ رابط المستودع (HTTPS أو SSH)

### 2. ربط المستودع المحلي بالمستودع على GitHub
```bash
# اربط المستودع المحلي بالمستودع على GitHub
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git

# تحقق من الـ remote
git remote -v
```

### 3. رفع الفرع الجديد
```bash
# ارفع الفرع الحالي (professional-treasury-system) إلى GitHub
git push -u origin professional-treasury-system
```

### 4. التحقق من الرفع
```bash
# تحقق من حالة المستودع
git status

# تحقق من الفروع المحلية والبعيدة
git branch -a

# تحقق من الـ remotes
git remote -v
```

## 📋 معلومات الفرع الجديد:

### 🌿 الفرع الجديد: `professional-treasury-system`
- **نوع الفرع:** Feature Branch
- **الغرض:** نظام الخزنة الاحترافي المتكامل
- **الملفات:** 12 ملف
- **السطور:** 2,500+ سطر

### ✨ المميزات في الفرع الجديد:
- 🏦 نظام خزنة هرمي متقدم
- 👥 إدارة المستخدمين والأدوار
- 💰 إدارة المعاملات المالية
- 👨‍💼 إدارة العملاء والموردين
- 📦 إدارة المنتجات والمخزون
- 🧾 نظام الفواتير المتكامل
- 📊 التقارير والإحصائيات
- 🔔 نظام الإشعارات
- 🛡️ الأمان والحماية
- 🎨 واجهة مستخدم احترافية

### 🔄 إدارة الفروع:
```bash
# عرض جميع الفروع
git branch -a

# التبديل بين الفروع
git checkout main
git checkout professional-treasury-system

# دمج الفرع الجديد مع الفرع الرئيسي (عند الحاجة)
git checkout main
git merge professional-treasury-system
```

### 🚀 بعد الرفع على GitHub:
1. اذهب إلى [render.com](https://render.com)
2. أنشئ خدمة ويب جديدة
3. اربط مستودع GitHub
4. اختر الفرع: `professional-treasury-system`
5. استخدم الإعدادات:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`

### 🔑 بيانات تسجيل الدخول:
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `password`

---
**نظام الخزنة الاحترافي المتكامل** - جاهز للرفع على فرع جديد! 🎉