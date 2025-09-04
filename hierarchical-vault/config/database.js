import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hierarchical_vault',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// إنشاء pool للاتصالات
const pool = new Pool(dbConfig);

// اختبار الاتصال
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    process.exit(1);
  }
};

// تشغيل اختبار الاتصال عند بدء التطبيق
testConnection();

export default pool;