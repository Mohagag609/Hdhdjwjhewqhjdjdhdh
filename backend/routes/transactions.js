const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction, validateTransfer } = require('../middleware/validation');

const router = express.Router();

// Deposit money to treasury
router.post('/deposit', authenticateToken, validateTransaction, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { treasury_id, amount, description, reference_number } = req.body;

    // Check if treasury exists and is active
    const treasuryResult = await client.query(
      'SELECT id, name, balance FROM treasuries WHERE id = $1 AND is_active = true',
      [treasury_id]
    );

    if (treasuryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة أو غير نشطة'
      });
    }

    const treasury = treasuryResult.rows[0];

    // Create transaction record
    const transactionResult = await client.query(`
      INSERT INTO transactions (treasury_id, user_id, type, amount, description, reference_number)
      VALUES ($1, $2, 'deposit', $3, $4, $5)
      RETURNING *
    `, [treasury_id, req.user.id, amount, description, reference_number]);

    // Update treasury balance
    await client.query(
      'UPDATE treasuries SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, treasury_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'تم الإيداع بنجاح',
      data: {
        transaction: transactionResult.rows[0],
        new_balance: parseFloat(treasury.balance) + parseFloat(amount)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في عملية الإيداع'
    });
  } finally {
    client.release();
  }
});

// Withdraw money from treasury
router.post('/withdraw', authenticateToken, validateTransaction, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { treasury_id, amount, description, reference_number } = req.body;

    // Check if treasury exists and is active
    const treasuryResult = await client.query(
      'SELECT id, name, balance FROM treasuries WHERE id = $1 AND is_active = true',
      [treasury_id]
    );

    if (treasuryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'الخزينة غير موجودة أو غير نشطة'
      });
    }

    const treasury = treasuryResult.rows[0];

    // Check if sufficient balance
    if (parseFloat(treasury.balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'الرصيد غير كافي'
      });
    }

    // Create transaction record
    const transactionResult = await client.query(`
      INSERT INTO transactions (treasury_id, user_id, type, amount, description, reference_number)
      VALUES ($1, $2, 'withdrawal', $3, $4, $5)
      RETURNING *
    `, [treasury_id, req.user.id, amount, description, reference_number]);

    // Update treasury balance
    await client.query(
      'UPDATE treasuries SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, treasury_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'تم السحب بنجاح',
      data: {
        transaction: transactionResult.rows[0],
        new_balance: parseFloat(treasury.balance) - parseFloat(amount)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في عملية السحب'
    });
  } finally {
    client.release();
  }
});

// Transfer money between treasuries
router.post('/transfer', authenticateToken, validateTransfer, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { from_treasury_id, to_treasury_id, amount, description, reference_number } = req.body;

    // Check if both treasuries exist and are active
    const treasuriesResult = await client.query(`
      SELECT id, name, balance FROM treasuries 
      WHERE id IN ($1, $2) AND is_active = true
    `, [from_treasury_id, to_treasury_id]);

    if (treasuriesResult.rows.length !== 2) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'إحدى الخزائن غير موجودة أو غير نشطة'
      });
    }

    const fromTreasury = treasuriesResult.rows.find(t => t.id == from_treasury_id);
    const toTreasury = treasuriesResult.rows.find(t => t.id == to_treasury_id);

    // Check if sufficient balance in source treasury
    if (parseFloat(fromTreasury.balance) < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'الرصيد غير كافي في الخزينة المصدر'
      });
    }

    // Create transaction records for both treasuries
    const fromTransactionResult = await client.query(`
      INSERT INTO transactions (treasury_id, user_id, type, amount, description, reference_number, from_treasury_id, to_treasury_id)
      VALUES ($1, $2, 'transfer', $3, $4, $5, $6, $7)
      RETURNING *
    `, [from_treasury_id, req.user.id, amount, description, reference_number, from_treasury_id, to_treasury_id]);

    const toTransactionResult = await client.query(`
      INSERT INTO transactions (treasury_id, user_id, type, amount, description, reference_number, from_treasury_id, to_treasury_id)
      VALUES ($1, $2, 'transfer', $3, $4, $5, $6, $7)
      RETURNING *
    `, [to_treasury_id, req.user.id, amount, description, reference_number, from_treasury_id, to_treasury_id]);

    // Update balances
    await client.query(
      'UPDATE treasuries SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, from_treasury_id]
    );

    await client.query(
      'UPDATE treasuries SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, to_treasury_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'تم التحويل بنجاح',
      data: {
        from_transaction: fromTransactionResult.rows[0],
        to_transaction: toTransactionResult.rows[0],
        from_new_balance: parseFloat(fromTreasury.balance) - parseFloat(amount),
        to_new_balance: parseFloat(toTreasury.balance) + parseFloat(amount)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في عملية التحويل'
    });
  } finally {
    client.release();
  }
});

// Get all transactions with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      treasury_id, 
      start_date, 
      end_date,
      user_id 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        tr.name as treasury_name,
        u.username as user_name,
        ft.name as from_treasury_name,
        tt.name as to_treasury_name
      FROM transactions t
      JOIN treasuries tr ON t.treasury_id = tr.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN treasuries ft ON t.from_treasury_id = ft.id
      LEFT JOIN treasuries tt ON t.to_treasury_id = tt.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    if (treasury_id) {
      paramCount++;
      query += ` AND t.treasury_id = $${paramCount}`;
      params.push(treasury_id);
    }

    if (user_id) {
      paramCount++;
      query += ` AND t.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (start_date) {
      paramCount++;
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM transactions t
      JOIN treasuries tr ON t.treasury_id = tr.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (type) {
      countParamCount++;
      countQuery += ` AND t.type = $${countParamCount}`;
      countParams.push(type);
    }

    if (treasury_id) {
      countParamCount++;
      countQuery += ` AND t.treasury_id = $${countParamCount}`;
      countParams.push(treasury_id);
    }

    if (user_id) {
      countParamCount++;
      countQuery += ` AND t.user_id = $${countParamCount}`;
      countParams.push(user_id);
    }

    if (start_date) {
      countParamCount++;
      countQuery += ` AND t.created_at >= $${countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND t.created_at <= $${countParamCount}`;
      countParams.push(end_date);
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

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        t.*,
        tr.name as treasury_name,
        u.username as user_name,
        ft.name as from_treasury_name,
        tt.name as to_treasury_name
      FROM transactions t
      JOIN treasuries tr ON t.treasury_id = tr.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN treasuries ft ON t.from_treasury_id = ft.id
      LEFT JOIN treasuries tt ON t.to_treasury_id = tt.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المعاملة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المعاملة'
    });
  }
});

module.exports = router;