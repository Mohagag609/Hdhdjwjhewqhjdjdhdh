const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateTreasury } = require('../middleware/validation');

const router = express.Router();

// Get all treasuries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        pt.name as parent_name,
        COALESCE(
          (SELECT COUNT(*) FROM treasury_permissions tp 
           WHERE tp.treasury_id = t.id AND tp.user_id = $1), 0
        ) as has_permission
      FROM treasuries t
      LEFT JOIN treasuries pt ON t.parent_id = pt.id
      WHERE t.is_active = true
      ORDER BY t.type DESC, t.name
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get treasuries error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الخزائن'
    });
  }
});

// Get treasury by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        t.*,
        pt.name as parent_name
      FROM treasuries t
      LEFT JOIN treasuries pt ON t.parent_id = pt.id
      WHERE t.id = $1 AND t.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get treasury error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الخزينة'
    });
  }
});

// Create new treasury
router.post('/', authenticateToken, requireRole(['admin']), validateTreasury, async (req, res) => {
  try {
    const { name, type, parent_id, description, balance = 0 } = req.body;

    // Validate parent_id for sub treasuries
    if (type === 'sub' && parent_id) {
      const parentResult = await pool.query(
        'SELECT id FROM treasuries WHERE id = $1 AND type = $2',
        [parent_id, 'main']
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'الخزينة الرئيسية غير موجودة'
        });
      }
    }

    const result = await pool.query(`
      INSERT INTO treasuries (name, type, parent_id, description, balance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, type, parent_id, description, balance]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الخزينة بنجاح',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create treasury error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الخزينة'
    });
  }
});

// Update treasury
router.put('/:id', authenticateToken, requireRole(['admin']), validateTreasury, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await pool.query(`
      UPDATE treasuries 
      SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [name, description, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الخزينة بنجاح',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update treasury error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الخزينة'
    });
  }
});

// Get treasury balance
router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT balance FROM treasuries WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: {
        balance: parseFloat(result.rows[0].balance)
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الرصيد'
    });
  }
});

// Get treasury transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        u.username as user_name,
        ft.name as from_treasury_name,
        tt.name as to_treasury_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN treasuries ft ON t.from_treasury_id = ft.id
      LEFT JOIN treasuries tt ON t.to_treasury_id = tt.id
      WHERE t.treasury_id = $1
    `;

    const params = [id];

    if (type) {
      query += ` AND t.type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE treasury_id = $1';
    const countParams = [id];

    if (type) {
      countQuery += ' AND type = $2';
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المعاملات'
    });
  }
});

module.exports = router;