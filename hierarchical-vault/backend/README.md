# خزينة هرمية - الخادم الخلفي

## الوصف
خادم API لإدارة النظام المالي الهرمي، مبني باستخدام Node.js و Express.

## المتطلبات
- Node.js 16+
- MySQL 8.0+
- npm أو yarn

## التثبيت

1. تثبيت التبعيات:
```bash
npm install
```

2. إعداد متغيرات البيئة:
```bash
cp .env.example .env
```

3. تحديث ملف `.env` بالقيم المناسبة:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hierarchical_vault
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. إعداد قاعدة البيانات:
```bash
# تشغيل ملف SQL لإنشاء قاعدة البيانات
mysql -u root -p < ../database/schema.sql
```

## التشغيل

### وضع التطوير:
```bash
npm run dev
```

### وضع الإنتاج:
```bash
npm start
```

## API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - معلومات المستخدم الحالي
- `PUT /api/auth/change-password` - تغيير كلمة المرور

### الخزائن
- `GET /api/vaults` - الحصول على جميع الخزائن
- `GET /api/vaults/:id` - الحصول على خزينة محددة
- `POST /api/vaults` - إنشاء خزينة جديدة (أدمن فقط)
- `PUT /api/vaults/:id` - تحديث خزينة (أدمن فقط)
- `DELETE /api/vaults/:id` - حذف خزينة (أدمن فقط)
- `GET /api/vaults/hierarchy/tree` - الحصول على الهيكل الهرمي

### المشاريع
- `GET /api/projects` - الحصول على جميع المشاريع
- `GET /api/projects/:id` - الحصول على مشروع محدد
- `POST /api/projects` - إنشاء مشروع جديد (أدمن فقط)
- `PUT /api/projects/:id` - تحديث مشروع (أدمن فقط)
- `DELETE /api/projects/:id` - حذف مشروع (أدمن فقط)
- `GET /api/projects/vault/:vaultId` - مشاريع خزينة محددة

### التقارير المالية
- `GET /api/reports` - الحصول على التقارير المالية
- `GET /api/reports/:id` - الحصول على تقرير محدد
- `POST /api/reports` - إنشاء تقرير مالي جديد
- `PUT /api/reports/:id` - تحديث تقرير مالي
- `DELETE /api/reports/:id` - حذف تقرير مالي
- `GET /api/reports/stats/summary` - إحصائيات مالية

### المستخدمين
- `GET /api/users` - الحصول على جميع المستخدمين (أدمن فقط)
- `GET /api/users/:id` - الحصول على مستخدم محدد (أدمن فقط)
- `POST /api/users` - إنشاء مستخدم جديد (أدمن فقط)
- `PUT /api/users/:id` - تحديث مستخدم (أدمن فقط)
- `DELETE /api/users/:id` - حذف مستخدم (أدمن فقط)
- `PUT /api/users/:id/password` - تغيير كلمة مرور مستخدم (أدمن فقط)
- `GET /api/users/stats/summary` - إحصائيات المستخدمين

## الأمان
- JWT للمصادقة
- تشفير كلمات المرور باستخدام bcrypt
- التحقق من الصلاحيات على مستوى API
- حماية من SQL Injection
- CORS محدود

## قاعدة البيانات
- MySQL مع جداول منظمة
- علاقات بين الجداول
- فهارس لتحسين الأداء
- معاملات لضمان سلامة البيانات

## المستخدم الافتراضي
- اسم المستخدم: `admin`
- كلمة المرور: `password`
- الدور: `admin`