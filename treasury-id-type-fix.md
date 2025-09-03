# إصلاح خطأ نوع البيانات - treasury_id

## ✅ تم إصلاح المشكلة!

### المشكلة:
```
Type 'string' is not assignable to type 'number'.
Types of property 'treasury_id' are incompatible.
```

### السبب:
- `filters.treasury_id` معرف كـ `string` في الواجهة
- API يتوقع `treasury_id` كـ `number`
- تم إرسال `string` بدلاً من `number`

### الحل:
تحويل `treasury_id` من `string` إلى `number` قبل إرساله للـ API

### التغييرات المنجزة:

#### إصلاح frontend/src/pages/Transactions.tsx:
```typescript
// قبل
const response = await apiService.getTransactions(filters);

// بعد
// تحويل treasury_id إلى number إذا كان موجوداً
const apiFilters = {
  ...filters,
  treasury_id: filters.treasury_id ? parseInt(filters.treasury_id) : undefined
};
const response = await apiService.getTransactions(apiFilters);
```

### منطق التحويل:
- **إذا كان `treasury_id` موجود**: `parseInt(filters.treasury_id)`
- **إذا كان فارغ**: `undefined`
- **النتيجة**: `number | undefined` (متوافق مع API)

### أنواع البيانات:

#### في الواجهة:
```typescript
const [filters, setFilters] = useState({
  treasury_id: '',  // string للواجهة
  // ...
});
```

#### للـ API:
```typescript
const apiFilters = {
  treasury_id: number | undefined,  // number للـ API
  // ...
};
```

### الملفات المُحدثة:
- ✅ `frontend/src/pages/Transactions.tsx`

## 🚀 الآن يمكن النشر بنجاح!

### خطوات النشر:
```bash
git add .
git commit -m "Fix treasury_id type conversion - string to number"
git push origin main
```

ثم أعد المحاولة في Render - المشكلة ستكون محلولة! ✅

### ملاحظة:
- **الواجهة**: تستخدم `string` للسهولة
- **API**: يتوقع `number` للدقة
- **التحويل**: يتم تلقائياً قبل الإرسال