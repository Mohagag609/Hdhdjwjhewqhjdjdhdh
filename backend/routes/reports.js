const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get financial summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (start_date && end_date) {
      paramCount += 2;
      dateFilter = `WHERE t.created_at >= $1 AND t.created_at <= $2`;
      params.push(start_date, end_date);
    }

    // Get total deposits and withdrawals
    const summaryResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'transfer' AND treasury_id = from_treasury_id THEN amount ELSE 0 END) as total_transfers_out,
        SUM(CASE WHEN type = 'transfer' AND treasury_id = to_treasury_id THEN amount ELSE 0 END) as total_transfers_in,
        COUNT(*) as total_transactions
      FROM transactions t
      ${dateFilter}
    `, params);

    // Get treasury balances
    const balancesResult = await pool.query(`
      SELECT 
        name,
        balance,
        type
      FROM treasuries 
      WHERE is_active = true
      ORDER BY type DESC, name
    `);

    // Get total balance
    const totalBalance = balancesResult.rows.reduce((sum, treasury) => {
      return sum + parseFloat(treasury.balance);
    }, 0);

    // Get recent transactions
    const recentTransactionsResult = await pool.query(`
      SELECT 
        t.*,
        tr.name as treasury_name,
        u.username as user_name
      FROM transactions t
      JOIN treasuries tr ON t.treasury_id = tr.id
      JOIN users u ON t.user_id = u.id
      ${dateFilter}
      ORDER BY t.created_at DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        summary: {
          total_deposits: parseFloat(summaryResult.rows[0].total_deposits || 0),
          total_withdrawals: parseFloat(summaryResult.rows[0].total_withdrawals || 0),
          total_transfers_out: parseFloat(summaryResult.rows[0].total_transfers_out || 0),
          total_transfers_in: parseFloat(summaryResult.rows[0].total_transfers_in || 0),
          total_transactions: parseInt(summaryResult.rows[0].total_transactions || 0),
          total_balance: totalBalance
        },
        treasuries: balancesResult.rows,
        recent_transactions: recentTransactionsResult.rows
      }
    });

  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقرير المالي'
    });
  }
});

// Get treasury performance report
router.get('/treasury-performance', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (start_date && end_date) {
      paramCount += 2;
      dateFilter = `AND t.created_at >= $1 AND t.created_at <= $2`;
      params.push(start_date, end_date);
    }

    const result = await pool.query(`
      SELECT 
        tr.id,
        tr.name,
        tr.balance,
        tr.type,
        COUNT(t.id) as transaction_count,
        SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN t.type = 'transfer' AND t.treasury_id = t.from_treasury_id THEN t.amount ELSE 0 END) as transfers_out,
        SUM(CASE WHEN t.type = 'transfer' AND t.treasury_id = t.to_treasury_id THEN t.amount ELSE 0 END) as transfers_in
      FROM treasuries tr
      LEFT JOIN transactions t ON tr.id = t.treasury_id ${dateFilter}
      WHERE tr.is_active = true
      GROUP BY tr.id, tr.name, tr.balance, tr.type
      ORDER BY tr.type DESC, tr.name
    `, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        balance: parseFloat(row.balance),
        total_deposits: parseFloat(row.total_deposits || 0),
        total_withdrawals: parseFloat(row.total_withdrawals || 0),
        transfers_out: parseFloat(row.transfers_out || 0),
        transfers_in: parseFloat(row.transfers_in || 0),
        net_flow: parseFloat(row.total_deposits || 0) + parseFloat(row.transfers_in || 0) - parseFloat(row.total_withdrawals || 0) - parseFloat(row.transfers_out || 0)
      }))
    });

  } catch (error) {
    console.error('Treasury performance error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير أداء الخزائن'
    });
  }
});

// Get daily/monthly transaction trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { period = 'daily', start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (start_date && end_date) {
      paramCount += 2;
      dateFilter = `WHERE t.created_at >= $1 AND t.created_at <= $2`;
      params.push(start_date, end_date);
    }

    let groupBy = '';
    if (period === 'daily') {
      groupBy = 'DATE(t.created_at)';
    } else if (period === 'monthly') {
      groupBy = 'DATE_TRUNC(\'month\', t.created_at)';
    } else {
      groupBy = 'DATE_TRUNC(\'year\', t.created_at)';
    }

    const result = await pool.query(`
      SELECT 
        ${groupBy} as period,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END) as total_transfers
      FROM transactions t
      ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        period: row.period,
        transaction_count: parseInt(row.transaction_count),
        total_deposits: parseFloat(row.total_deposits || 0),
        total_withdrawals: parseFloat(row.total_withdrawals || 0),
        total_transfers: parseFloat(row.total_transfers || 0),
        net_flow: parseFloat(row.total_deposits || 0) - parseFloat(row.total_withdrawals || 0)
      }))
    });

  } catch (error) {
    console.error('Trends report error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير الاتجاهات'
    });
  }
});

// Get user activity report
router.get('/user-activity', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (start_date && end_date) {
      paramCount += 2;
      dateFilter = `AND t.created_at >= $1 AND t.created_at <= $2`;
      params.push(start_date, end_date);
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        COUNT(t.id) as transaction_count,
        SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN t.type = 'transfer' THEN t.amount ELSE 0 END) as total_transfers,
        MAX(t.created_at) as last_activity
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id ${dateFilter}
      GROUP BY u.id, u.username, u.email, u.role
      ORDER BY transaction_count DESC, last_activity DESC
    `, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        total_deposits: parseFloat(row.total_deposits || 0),
        total_withdrawals: parseFloat(row.total_withdrawals || 0),
        total_transfers: parseFloat(row.total_transfers || 0),
        total_amount: parseFloat(row.total_deposits || 0) + parseFloat(row.total_withdrawals || 0) + parseFloat(row.total_transfers || 0)
      }))
    });

  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تقرير نشاط المستخدمين'
    });
  }
});

module.exports = router;