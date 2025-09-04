const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// تسجيل الدخول
router.post('/login', [
  body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // البحث عن المستخدم
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, username]
    );
    const users = result.rows;

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const user = users[0];

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // إنشاء توكن
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تسجيل الخروج (إضافة التوكن للقائمة السوداء)
router.post('/logout', authenticateToken, (req, res) => {
  // في تطبيق حقيقي، يمكن إضافة التوكن للقائمة السوداء
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

// الحصول على معلومات المستخدم الحالي
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على معلومات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تغيير كلمة المرور
router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword').isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // الحصول على كلمة المرور الحالية
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // تشفير كلمة المرور الجديدة
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;