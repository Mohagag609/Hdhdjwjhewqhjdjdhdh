-- ملف تهيئة قاعدة البيانات
-- تشغيل هذا الملف لإنشاء قاعدة البيانات والجداول

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS hierarchical_vault;
USE hierarchical_vault;

-- تشغيل ملف المخطط
SOURCE schema.sql;

-- رسالة نجاح
SELECT 'تم إنشاء قاعدة البيانات بنجاح!' AS message;