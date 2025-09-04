import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// الحصول على جميع المستخدمين (أدمن فقط)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('خطأ في الحصول على المستخدمين:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على مستخدم محدد (أدمن فقط)
router.get('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('خطأ في الحصول على المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء مستخدم جديد (أدمن فقط)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('username').isLength({ min: 3 }).withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role').isIn(['admin', 'user']).withMessage('الدور يجب أن يكون admin أو user')
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

    const { username, email, password, role } = req.body;

    // التحقق من عدم وجود اسم مستخدم أو بريد إلكتروني مكرر
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل'
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    // الحصول على المستخدم الجديد
    const [newUser] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at
      FROM users
      WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: newUser[0]
    });
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث مستخدم (أدمن فقط)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('username').optional().isLength({ min: 3 }).withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('role').optional().isIn(['admin', 'user']).withMessage('الدور يجب أن يكون admin أو user')
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

    const { id } = req.params;
    const updates = req.body;

    // التحقق من وجود المستخدم
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من عدم وجود اسم مستخدم أو بريد إلكتروني مكرر
    if (updates.username || updates.email) {
      let checkQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
      const checkParams = [
        updates.username || '',
        updates.email || '',
        id
      ];

      const [duplicateUsers] = await pool.execute(checkQuery, checkParams);

      if (duplicateUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل'
        });
      }
    }

    // تحديث المستخدم
    const updateFields = [];
    const updateValues = [];

    if (updates.username) {
      updateFields.push('username = ?');
      updateValues.push(updates.username);
    }
    if (updates.email) {
      updateFields.push('email = ?');
      updateValues.push(updates.email);
    }
    if (updates.role) {
      updateFields.push('role = ?');
      updateValues.push(updates.role);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // الحصول على المستخدم المحدث
    const [updatedUser] = await pool.execute(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// حذف مستخدم (أدمن فقط)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المستخدم
    const [existingUsers] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // منع حذف المستخدم الحالي
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف حسابك الخاص'
      });
    }

    // التحقق من وجود تقارير مالية مرتبطة
    const [reports] = await pool.execute(
      'SELECT COUNT(*) as count FROM financial_reports WHERE user_id = ?',
      [id]
    );

    if (reports[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف مستخدم مرتبط بتقارير مالية'
      });
    }

    // حذف المستخدم
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تغيير كلمة مرور مستخدم (أدمن فقط)
router.put('/:id/password', [
  authenticateToken,
  requireAdmin,
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

    const { id } = req.params;
    const { newPassword } = req.body;

    // التحقق من وجود المستخدم
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, id]
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

// الحصول على إحصائيات المستخدمين
router.get('/stats/summary', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    const summary = {
      totalUsers: 0,
      adminCount: 0,
      userCount: 0
    };

    stats.forEach(stat => {
      summary.totalUsers += stat.count;
      if (stat.role === 'admin') {
        summary.adminCount = stat.count;
      } else {
        summary.userCount = stat.count;
      }
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المستخدمين:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

export default router;