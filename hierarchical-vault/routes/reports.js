import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireUserOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// الحصول على جميع التقارير المالية
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, vault_id, project_id, start_date, end_date, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT 
        fr.*,
        v.name as vault_name,
        p.name as project_name,
        u.username as user_name
      FROM financial_reports fr
      LEFT JOIN vaults v ON fr.vault_id = v.id
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];

    // فلترة حسب النوع
    if (type && ['income', 'expense'].includes(type)) {
      query += ' AND fr.type = ?';
      queryParams.push(type);
    }

    // فلترة حسب الخزينة
    if (vault_id) {
      query += ' AND fr.vault_id = ?';
      queryParams.push(vault_id);
    }

    // فلترة حسب المشروع
    if (project_id) {
      query += ' AND fr.project_id = ?';
      queryParams.push(project_id);
    }

    // فلترة حسب التاريخ
    if (start_date) {
      query += ' AND fr.report_date >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ' AND fr.report_date <= ?';
      queryParams.push(end_date);
    }

    query += ' ORDER BY fr.report_date DESC, fr.created_at DESC';

    // إضافة pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [reports] = await pool.execute(query, queryParams);

    // الحصول على العدد الإجمالي
    let countQuery = `
      SELECT COUNT(*) as total
      FROM financial_reports fr
      WHERE 1=1
    `;
    
    const countParams = [];
    if (type && ['income', 'expense'].includes(type)) {
      countQuery += ' AND fr.type = ?';
      countParams.push(type);
    }
    if (vault_id) {
      countQuery += ' AND fr.vault_id = ?';
      countParams.push(vault_id);
    }
    if (project_id) {
      countQuery += ' AND fr.project_id = ?';
      countParams.push(project_id);
    }
    if (start_date) {
      countQuery += ' AND fr.report_date >= ?';
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += ' AND fr.report_date <= ?';
      countParams.push(end_date);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على التقارير المالية:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على تقرير محدد
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [reports] = await pool.execute(`
      SELECT 
        fr.*,
        v.name as vault_name,
        p.name as project_name,
        u.username as user_name
      FROM financial_reports fr
      LEFT JOIN vaults v ON fr.vault_id = v.id
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.id = ?
    `, [id]);

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    res.json({
      success: true,
      data: reports[0]
    });
  } catch (error) {
    console.error('خطأ في الحصول على التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء تقرير مالي جديد
router.post('/', [
  authenticateToken,
  requireUserOrAdmin,
  body('type').isIn(['income', 'expense']).withMessage('نوع التقرير يجب أن يكون income أو expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('description').optional(),
  body('vault_id').isInt().withMessage('معرف الخزينة مطلوب'),
  body('project_id').optional().isInt().withMessage('معرف المشروع يجب أن يكون رقم'),
  body('report_date').isISO8601().withMessage('تاريخ التقرير غير صحيح')
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

    const { type, amount, description, vault_id, project_id, report_date } = req.body;
    const user_id = req.user.id;

    // التحقق من وجود الخزينة
    const [vaults] = await pool.execute(
      'SELECT id, balance FROM vaults WHERE id = ?',
      [vault_id]
    );

    if (vaults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // التحقق من وجود المشروع إذا تم تحديده
    if (project_id) {
      const [projects] = await pool.execute(
        'SELECT id FROM projects WHERE id = ? AND vault_id = ?',
        [project_id, vault_id]
      );

      if (projects.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'المشروع غير موجود أو لا ينتمي لهذه الخزينة'
        });
      }
    }

    // بدء المعاملة
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // إنشاء التقرير المالي
      const [result] = await connection.execute(
        'INSERT INTO financial_reports (type, amount, description, vault_id, project_id, user_id, report_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [type, amount, description || null, vault_id, project_id || null, user_id, report_date]
      );

      // تحديث رصيد الخزينة
      const newBalance = type === 'income' 
        ? parseFloat(vaults[0].balance) + parseFloat(amount)
        : parseFloat(vaults[0].balance) - parseFloat(amount);

      await connection.execute(
        'UPDATE vaults SET balance = ? WHERE id = ?',
        [newBalance, vault_id]
      );

      // تسجيل المعاملة
      await connection.execute(
        'INSERT INTO transactions (type, amount, to_vault_id, description, user_id) VALUES (?, ?, ?, ?, ?)',
        [type === 'income' ? 'deposit' : 'withdrawal', amount, vault_id, description || null, user_id]
      );

      await connection.commit();

      // الحصول على التقرير الجديد
      const [newReport] = await pool.execute(`
        SELECT 
          fr.*,
          v.name as vault_name,
          p.name as project_name,
          u.username as user_name
        FROM financial_reports fr
        LEFT JOIN vaults v ON fr.vault_id = v.id
        LEFT JOIN projects p ON fr.project_id = p.id
        LEFT JOIN users u ON fr.user_id = u.id
        WHERE fr.id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء التقرير المالي بنجاح',
        data: newReport[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('خطأ في إنشاء التقرير المالي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث تقرير مالي
router.put('/:id', [
  authenticateToken,
  requireUserOrAdmin,
  body('type').optional().isIn(['income', 'expense']).withMessage('نوع التقرير يجب أن يكون income أو expense'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('description').optional(),
  body('report_date').optional().isISO8601().withMessage('تاريخ التقرير غير صحيح')
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

    // التحقق من وجود التقرير
    const [existingReports] = await pool.execute(
      'SELECT * FROM financial_reports WHERE id = ?',
      [id]
    );

    if (existingReports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    const existingReport = existingReports[0];

    // التحقق من الصلاحيات (المستخدم يمكنه تعديل تقاريره فقط)
    if (req.user.role !== 'admin' && existingReport.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا التقرير'
      });
    }

    // بدء المعاملة
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // إعادة حساب رصيد الخزينة (إزالة التأثير القديم)
      const oldAmount = parseFloat(existingReport.amount);
      const oldType = existingReport.type;
      
      const [vaults] = await connection.execute(
        'SELECT balance FROM vaults WHERE id = ?',
        [existingReport.vault_id]
      );

      let newBalance = parseFloat(vaults[0].balance);
      
      // إزالة التأثير القديم
      if (oldType === 'income') {
        newBalance -= oldAmount;
      } else {
        newBalance += oldAmount;
      }

      // تطبيق التغييرات الجديدة
      const newAmount = updates.amount ? parseFloat(updates.amount) : oldAmount;
      const newType = updates.type || oldType;

      if (newType === 'income') {
        newBalance += newAmount;
      } else {
        newBalance -= newAmount;
      }

      // تحديث التقرير
      const updateFields = [];
      const updateValues = [];

      if (updates.type) {
        updateFields.push('type = ?');
        updateValues.push(updates.type);
      }
      if (updates.amount) {
        updateFields.push('amount = ?');
        updateValues.push(updates.amount);
      }
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updates.description);
      }
      if (updates.report_date) {
        updateFields.push('report_date = ?');
        updateValues.push(updates.report_date);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await connection.execute(
          `UPDATE financial_reports SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // تحديث رصيد الخزينة
      await connection.execute(
        'UPDATE vaults SET balance = ? WHERE id = ?',
        [newBalance, existingReport.vault_id]
      );

      await connection.commit();

      // الحصول على التقرير المحدث
      const [updatedReport] = await pool.execute(`
        SELECT 
          fr.*,
          v.name as vault_name,
          p.name as project_name,
          u.username as user_name
        FROM financial_reports fr
        LEFT JOIN vaults v ON fr.vault_id = v.id
        LEFT JOIN projects p ON fr.project_id = p.id
        LEFT JOIN users u ON fr.user_id = u.id
        WHERE fr.id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'تم تحديث التقرير المالي بنجاح',
        data: updatedReport[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('خطأ في تحديث التقرير المالي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// حذف تقرير مالي
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود التقرير
    const [existingReports] = await pool.execute(
      'SELECT * FROM financial_reports WHERE id = ?',
      [id]
    );

    if (existingReports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود'
      });
    }

    const existingReport = existingReports[0];

    // التحقق من الصلاحيات (المستخدم يمكنه حذف تقاريره فقط)
    if (req.user.role !== 'admin' && existingReport.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا التقرير'
      });
    }

    // بدء المعاملة
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // إعادة حساب رصيد الخزينة (إزالة التأثير)
      const amount = parseFloat(existingReport.amount);
      const type = existingReport.type;
      
      const [vaults] = await connection.execute(
        'SELECT balance FROM vaults WHERE id = ?',
        [existingReport.vault_id]
      );

      let newBalance = parseFloat(vaults[0].balance);
      
      // إزالة التأثير
      if (type === 'income') {
        newBalance -= amount;
      } else {
        newBalance += amount;
      }

      // حذف التقرير
      await connection.execute(
        'DELETE FROM financial_reports WHERE id = ?',
        [id]
      );

      // تحديث رصيد الخزينة
      await connection.execute(
        'UPDATE vaults SET balance = ? WHERE id = ?',
        [newBalance, existingReport.vault_id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'تم حذف التقرير المالي بنجاح'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('خطأ في حذف التقرير المالي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على إحصائيات مالية
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { vault_id, project_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM financial_reports
      WHERE 1=1
    `;
    
    const queryParams = [];

    if (vault_id) {
      query += ' AND vault_id = ?';
      queryParams.push(vault_id);
    }

    if (project_id) {
      query += ' AND project_id = ?';
      queryParams.push(project_id);
    }

    if (start_date) {
      query += ' AND report_date >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ' AND report_date <= ?';
      queryParams.push(end_date);
    }

    query += ' GROUP BY type';

    const [stats] = await pool.execute(query, queryParams);

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    stats.forEach(stat => {
      if (stat.type === 'income') {
        summary.totalIncome = parseFloat(stat.total_amount);
        summary.incomeCount = stat.count;
      } else {
        summary.totalExpense = parseFloat(stat.total_amount);
        summary.expenseCount = stat.count;
      }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpense;

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('خطأ في الحصول على الإحصائيات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

export default router;