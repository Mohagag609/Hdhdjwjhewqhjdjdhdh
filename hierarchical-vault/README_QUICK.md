# خزينة هرمية - دليل سريع 🚀

## التشغيل المحلي

### مع Neon (مستحسن):
```bash
./quick-start-neon.sh
```

### مع MySQL:
```bash
./start.sh
```

## النشر على Render

### مع Neon (مستحسن):
1. شغل SQL: `psql 'postgresql://neondb_owner:npg_YKgCwrf10JDV@ep-summer-fire-ad2my2c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' -f database/schema-neon.sql`
2. ارفع الكود إلى GitHub
3. اذهب إلى [Render](https://dashboard.render.com)
4. "New +" → "Blueprint"
5. اختر المستودع

### مع قاعدة بيانات منفصلة:
راجع [DEPLOYMENT.md](DEPLOYMENT.md)

## الروابط
- **المحلي**: http://localhost:3000
- **Render**: https://hierarchical-vault-frontend.onrender.com
- **بيانات الدخول**: admin / password

## الميزات
- ✅ إدارة الخزائن الهرمية
- ✅ إدارة المشاريع
- ✅ التقارير المالية
- ✅ إدارة المستخدمين
- ✅ مخططات بيانية
- ✅ نظام إشعارات
- ✅ تصدير البيانات
- ✅ دعم Neon و MySQL

## الدعم
- [التوثيق الكامل](README.md)
- [النشر على Render](RENDER_NEON_DEPLOYMENT.md)
- [إعداد Neon](NEON_SETUP.md)