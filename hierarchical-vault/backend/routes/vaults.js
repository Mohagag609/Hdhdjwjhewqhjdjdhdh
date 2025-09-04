const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// الحصول على جميع الخزائن
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [vaults] = await pool.execute(`
      SELECT 
        v.*,
        p.name as parent_name,
        (SELECT COUNT(*) FROM vaults v2 WHERE v2.parent_id = v.id) as children_count
      FROM vaults v
      LEFT JOIN vaults p ON v.parent_id = p.id
      ORDER BY v.is_main DESC, v.name ASC
    `);

    res.json({
      success: true,
      data: vaults
    });
  } catch (error) {
    console.error('خطأ في الحصول على الخزائن:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على خزينة محددة
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [vaults] = await pool.execute(`
      SELECT 
        v.*,
        p.name as parent_name,
        (SELECT COUNT(*) FROM vaults v2 WHERE v2.parent_id = v.id) as children_count
      FROM vaults v
      LEFT JOIN vaults p ON v.parent_id = p.id
      WHERE v.id = ?
    `, [id]);

    if (vaults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // الحصول على الخزائن الفرعية
    const [children] = await pool.execute(`
      SELECT * FROM vaults WHERE parent_id = ? ORDER BY name ASC
    `, [id]);

    // الحصول على المشاريع المرتبطة
    const [projects] = await pool.execute(`
      SELECT * FROM projects WHERE vault_id = ? ORDER BY name ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...vaults[0],
        children,
        projects
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء خزينة جديدة (أدمن فقط)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().withMessage('اسم الخزينة مطلوب'),
  body('description').optional(),
  body('parent_id').optional().isInt().withMessage('معرف الخزينة الأب يجب أن يكون رقم')
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

    const { name, description, parent_id } = req.body;

    // التحقق من وجود الخزينة الأب إذا تم تحديدها
    if (parent_id) {
      const [parentVaults] = await pool.execute(
        'SELECT id FROM vaults WHERE id = ?',
        [parent_id]
      );

      if (parentVaults.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'الخزينة الأب غير موجودة'
        });
      }
    }

    // إنشاء الخزينة
    const [result] = await pool.execute(
      'INSERT INTO vaults (name, description, parent_id) VALUES (?, ?, ?)',
      [name, description || null, parent_id || null]
    );

    // الحصول على الخزينة الجديدة
    const [newVault] = await pool.execute(
      'SELECT * FROM vaults WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الخزينة بنجاح',
      data: newVault[0]
    });
  } catch (error) {
    console.error('خطأ في إنشاء الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث خزينة (أدمن فقط)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().withMessage('اسم الخزينة مطلوب'),
  body('description').optional(),
  body('parent_id').optional().isInt().withMessage('معرف الخزينة الأب يجب أن يكون رقم')
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
    const { name, description, parent_id } = req.body;

    // التحقق من وجود الخزينة
    const [existingVaults] = await pool.execute(
      'SELECT id, is_main FROM vaults WHERE id = ?',
      [id]
    );

    if (existingVaults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // منع تعديل الخزينة الرئيسية
    if (existingVaults[0].is_main) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل الخزينة الرئيسية'
      });
    }

    // التحقق من وجود الخزينة الأب إذا تم تحديدها
    if (parent_id) {
      const [parentVaults] = await pool.execute(
        'SELECT id FROM vaults WHERE id = ? AND id != ?',
        [parent_id, id]
      );

      if (parentVaults.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'الخزينة الأب غير موجودة أو لا يمكن أن تكون نفس الخزينة'
        });
      }
    }

    // تحديث الخزينة
    await pool.execute(
      'UPDATE vaults SET name = ?, description = ?, parent_id = ? WHERE id = ?',
      [name, description || null, parent_id || null, id]
    );

    // الحصول على الخزينة المحدثة
    const [updatedVault] = await pool.execute(
      'SELECT * FROM vaults WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'تم تحديث الخزينة بنجاح',
      data: updatedVault[0]
    });
  } catch (error) {
    console.error('خطأ في تحديث الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// حذف خزينة (أدمن فقط)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود الخزينة
    const [existingVaults] = await pool.execute(
      'SELECT id, is_main FROM vaults WHERE id = ?',
      [id]
    );

    if (existingVaults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    // منع حذف الخزينة الرئيسية
    if (existingVaults[0].is_main) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الخزينة الرئيسية'
      });
    }

    // التحقق من وجود خزائن فرعية
    const [children] = await pool.execute(
      'SELECT COUNT(*) as count FROM vaults WHERE parent_id = ?',
      [id]
    );

    if (children[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف خزينة تحتوي على خزائن فرعية'
      });
    }

    // التحقق من وجود مشاريع مرتبطة
    const [projects] = await pool.execute(
      'SELECT COUNT(*) as count FROM projects WHERE vault_id = ?',
      [id]
    );

    if (projects[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف خزينة مرتبطة بمشاريع'
      });
    }

    // حذف الخزينة
    await pool.execute('DELETE FROM vaults WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'تم حذف الخزينة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الخزينة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على هيكل الخزائن الهرمي
router.get('/hierarchy/tree', authenticateToken, async (req, res) => {
  try {
    const [vaults] = await pool.execute(`
      SELECT 
        v.*,
        p.name as parent_name,
        (SELECT COUNT(*) FROM vaults v2 WHERE v2.parent_id = v.id) as children_count
      FROM vaults v
      LEFT JOIN vaults p ON v.parent_id = p.id
      ORDER BY v.is_main DESC, v.name ASC
    `);

    // بناء الهيكل الهرمي
    const buildHierarchy = (vaults, parentId = null) => {
      return vaults
        .filter(vault => vault.parent_id === parentId)
        .map(vault => ({
          ...vault,
          children: buildHierarchy(vaults, vault.id)
        }));
    };

    const hierarchy = buildHierarchy(vaults);

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('خطأ في الحصول على الهيكل الهرمي:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;