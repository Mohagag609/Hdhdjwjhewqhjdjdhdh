const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'رمز الوصول مطلوب' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'رمز الوصول غير صالح' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'المصادقة مطلوبة' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};