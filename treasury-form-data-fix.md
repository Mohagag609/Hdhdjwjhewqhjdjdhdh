# إصلاح خطأ TreasuryFormData - is_active

## ✅ تم إصلاح المشكلة!

### المشكلة:
```
'is_active' does not exist in type 'Partial<TreasuryFormData>'.
```

### السبب:
- `TreasuryFormData` لا يحتوي على خاصية `is_active`
- تم محاولة استخدام `is_active: false` في `updateTreasury`
- TypeScript رفض الخاصية غير المعرفة

### الحل:
إضافة `is_active?: boolean` إلى `TreasuryFormData`

### التغييرات المنجزة:

#### إصلاح frontend/src/types/index.ts:
```typescript
// قبل
export interface TreasuryFormData {
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  description?: string;
  balance?: number;
}

// بعد
export interface TreasuryFormData {
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  description?: string;
  balance?: number;
  is_active?: boolean;  // ✅ إضافة جديدة
}
```

### الاستخدام:
```typescript
// في frontend/src/pages/Treasuries.tsx
const response = await apiService.updateTreasury(treasury.id, { 
  ...treasury, 
  is_active: false  // ✅ الآن يعمل
});
```

### أنواع البيانات:

#### Treasury (من API):
```typescript
interface Treasury {
  id: number;
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  balance: number;
  description?: string;
  is_active: boolean;  // موجود في API
  created_at: string;
  updated_at: string;
}
```

#### TreasuryFormData (للواجهة):
```typescript
interface TreasuryFormData {
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  description?: string;
  balance?: number;
  is_active?: boolean;  // ✅ تم إضافته
}
```

### الملفات المُحدثة:
- ✅ `frontend/src/types/index.ts`

## 🚀 الآن يمكن النشر بنجاح!

### خطوات النشر:
```bash
git add .
git commit -m "Add is_active to TreasuryFormData interface"
git push origin main
```

ثم أعد المحاولة في Render - المشكلة ستكون محلولة! ✅

### ملاحظة:
- **API**: يدعم `is_active`
- **الواجهة**: الآن تدعم `is_active`
- **التوافق**: كامل بين API والواجهة