const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// الحصول على جميع المشاريع
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        v.name as vault_name,
        v.balance as vault_balance,
        (SELECT COUNT(*) FROM financial_reports fr WHERE fr.project_id = p.id) as reports_count
      FROM projects p
      LEFT JOIN vaults v ON p.vault_id = v.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('خطأ في الحصول على المشاريع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على مشروع محدد
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        v.name as vault_name,
        v.balance as vault_balance
      FROM projects p
      LEFT JOIN vaults v ON p.vault_id = v.id
      WHERE p.id = ?
    `, [id]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }

    // الحصول على التقارير المالية للمشروع
    const [reports] = await pool.execute(`
      SELECT 
        fr.*,
        u.username as user_name
      FROM financial_reports fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.project_id = ?
      ORDER BY fr.report_date DESC, fr.created_at DESC
    `, [id]);

    // حساب الإجماليات
    const totalIncome = reports
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const totalExpense = reports
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const netProfit = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        ...projects[0],
        reports,
        summary: {
          totalIncome,
          totalExpense,
          netProfit,
          reportsCount: reports.length
        }
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء مشروع جديد (أدمن فقط)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().withMessage('اسم المشروع مطلوب'),
  body('description').optional(),
  body('vault_id').isInt().withMessage('معرف الخزينة مطلوب'),
  body('status').optional().isIn(['active', 'completed', 'suspended']).withMessage('حالة المشروع غير صحيحة')
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

    const { name, description, vault_id, status = 'active' } = req.body;

    // التحقق من وجود الخزينة
    const [vaults] = await pool.execute(
      'SELECT id FROM vaults WHERE id = ?',
      [vault_id]
    );

    if (vaults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // إنشاء المشروع
    const [result] = await pool.execute(
      'INSERT INTO projects (name, description, vault_id, status) VALUES (?, ?, ?, ?)',
      [name, description || null, vault_id, status]
    );

    // الحصول على المشروع الجديد
    const [newProject] = await pool.execute(`
      SELECT 
        p.*,
        v.name as vault_name,
        v.balance as vault_balance
      FROM projects p
      LEFT JOIN vaults v ON p.vault_id = v.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المشروع بنجاح',
      data: newProject[0]
    });
  } catch (error) {
    console.error('خطأ في إنشاء المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث مشروع (أدمن فقط)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().withMessage('اسم المشروع مطلوب'),
  body('description').optional(),
  body('vault_id').isInt().withMessage('معرف الخزينة مطلوب'),
  body('status').isIn(['active', 'completed', 'suspended']).withMessage('حالة المشروع غير صحيحة')
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
    const { name, description, vault_id, status } = req.body;

    // التحقق من وجود المشروع
    const [existingProjects] = await pool.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );

    if (existingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }

    // التحقق من وجود الخزينة
    const [vaults] = await pool.execute(
      'SELECT id FROM vaults WHERE id = ?',
      [vault_id]
    );

    if (vaults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // تحديث المشروع
    await pool.execute(
      'UPDATE projects SET name = ?, description = ?, vault_id = ?, status = ? WHERE id = ?',
      [name, description || null, vault_id, status, id]
    );

    // الحصول على المشروع المحدث
    const [updatedProject] = await pool.execute(`
      SELECT 
        p.*,
        v.name as vault_name,
        v.balance as vault_balance
      FROM projects p
      LEFT JOIN vaults v ON p.vault_id = v.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      data: updatedProject[0]
    });
  } catch (error) {
    console.error('خطأ في تحديث المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// حذف مشروع (أدمن فقط)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المشروع
    const [existingProjects] = await pool.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );

    if (existingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }

    // التحقق من وجود تقارير مالية مرتبطة
    const [reports] = await pool.execute(
      'SELECT COUNT(*) as count FROM financial_reports WHERE project_id = ?',
      [id]
    );

    if (reports[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف مشروع مرتبط بتقارير مالية'
      });
    }

    // حذف المشروع
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'تم حذف المشروع بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على مشاريع خزينة محددة
router.get('/vault/:vaultId', authenticateToken, async (req, res) => {
  try {
    const { vaultId } = req.params;

    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        v.name as vault_name,
        v.balance as vault_balance,
        (SELECT COUNT(*) FROM financial_reports fr WHERE fr.project_id = p.id) as reports_count
      FROM projects p
      LEFT JOIN vaults v ON p.vault_id = v.id
      WHERE p.vault_id = ?
      ORDER BY p.created_at DESC
    `, [vaultId]);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('خطأ في الحصول على مشاريع الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;