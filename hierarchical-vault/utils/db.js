// مساعد قاعدة البيانات للتحويل من MySQL إلى PostgreSQL
const pool = require('../config/database');

// دالة مساعدة لتنفيذ الاستعلامات
const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// دالة مساعدة للحصول على صف واحد
const queryOne = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

// دالة مساعدة للحصول على جميع الصفوف
const queryAll = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows;
};

// دالة مساعدة للتنفيذ بدون إرجاع بيانات
const execute = async (text, params = []) => {
  const result = await query(text, params);
  return result;
};

module.exports = {
  query,
  queryOne,
  queryAll,
  execute,
  pool
};