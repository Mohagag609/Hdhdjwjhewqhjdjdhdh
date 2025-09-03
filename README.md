## نظام إدارة مشاريع البناء - Backend (NestJS + Prisma)

### تشغيل سريع
- cd backend
- npm install (إن لم تكن مثبتة)
- npm run dev
- افتح `http://localhost:3000/docs` لمشاهدة Swagger

### تدفق أساسي (cURL)
1) إنشاء مشروع:
```
curl -s -X POST http://localhost:3000/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"مشروع بناء 1","startDate":"2025-01-01","endDate":"2026-01-01"}'
```

2) إضافة شركاء (إجمالي النسب = 100):
```
curl -s -X POST http://localhost:3000/projects/1/partners \
  -H 'Content-Type: application/json' \
  -d '[{"name":"شريك A","percentage":50},{"name":"شريك B","percentage":50}]'
```

3) إضافة مرحلة:
```
curl -s -X POST http://localhost:3000/projects/1/phases \
  -H 'Content-Type: application/json' \
  -d '{"name":"الأساسات","plannedAmount":100000}'
```

4) إضافة بند مادة لمورد:
```
curl -s -X POST http://localhost:3000/projects/1/phases/1/materials \
  -H 'Content-Type: application/json' \
  -d '{"supplierName":"مورد الأسمنت","name":"أسمنت","quantity":10,"unit":"طن","unitPrice":11500}'
```

5) قبض مساهمة شريك للخزينة:
```
curl -s -X POST http://localhost:3000/projects/1/treasury/receipts \
  -H 'Content-Type: application/json' \
  -d '{"partnerName":"شريك A","amount":60000}'
```

6) صرف لمورد:
```
curl -s -X POST http://localhost:3000/projects/1/treasury/payments \
  -H 'Content-Type: application/json' \
  -d '{"supplierName":"مورد الأسمنت","amount":100000,"phaseId":1}'
```

7) رصيد الخزينة:
```
curl -s http://localhost:3000/projects/1/treasury/balance
```

8) تشغيل تسوية مرحلة وعرض النتائج:
```
curl -s -X POST http://localhost:3000/projects/1/settlements/run \
  -H 'Content-Type: application/json' \
  -d '{"phaseId":1}'

curl -s http://localhost:3000/projects/1/settlements/1
```

9) التقارير:
- المدفوعات للموردين: `/projects/1/reports/suppliers?phaseId=1`
- ملخص الخزينة: `/projects/1/reports/treasury`
- التسوية: `/projects/1/reports/settlements?phaseId=1`

### ملاحظات
- يعمل على SQLite للتطوير. للإنتاج استخدم PostgreSQL مع Prisma Migrate.
- جميع الحركات المالية تمر عبر دفتر خزينة موحد مرتبط بالمشروع.
