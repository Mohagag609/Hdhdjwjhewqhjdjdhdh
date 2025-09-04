import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// التحقق من صحة التوكن
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'مطلوب توكن للمصادقة'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // التحقق من وجود المستخدم في قاعدة البيانات
    const [users] = await pool.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'توكن غير صالح'
    });
  }
};

// التحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'مطلوب صلاحيات أدمن للوصول لهذه الوظيفة'
    });
  }
  next();
};

// التحقق من صلاحيات المستخدم أو الأدمن
const requireUserOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'مطلوب صلاحيات مستخدم للوصول لهذه الوظيفة'
    });
  }
  next();
};

export {
  authenticateToken,
  requireAdmin,
  requireUserOrAdmin
};