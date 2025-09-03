const pool = require('../config/database');

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create treasuries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS treasuries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('main', 'sub')),
        parent_id INTEGER REFERENCES treasuries(id),
        balance DECIMAL(15,2) DEFAULT 0.00,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        treasury_id INTEGER NOT NULL REFERENCES treasuries(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        reference_number VARCHAR(50),
        from_treasury_id INTEGER REFERENCES treasuries(id),
        to_treasury_id INTEGER REFERENCES treasuries(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create treasury_permissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS treasury_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        treasury_id INTEGER NOT NULL REFERENCES treasuries(id),
        can_view BOOLEAN DEFAULT false,
        can_deposit BOOLEAN DEFAULT false,
        can_withdraw BOOLEAN DEFAULT false,
        can_transfer BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, treasury_id)
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_treasury_id ON transactions(treasury_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);

    console.log('✅ Database tables created successfully');

    // Insert default main treasury
    const mainTreasuryResult = await pool.query(`
      SELECT id FROM treasuries WHERE type = 'main' LIMIT 1
    `);

    if (mainTreasuryResult.rows.length === 0) {
      await pool.query(`
        INSERT INTO treasuries (name, type, balance, description) 
        VALUES ('الخزينة الرئيسية', 'main', 100000.00, 'الخزينة الرئيسية للنظام')
      `);
      console.log('✅ Default main treasury created');
    }

    // Insert default sub treasuries
    const subTreasuries = [
      { name: 'خزينة المصروفات اليومية', balance: 5000.00, description: 'للمصروفات اليومية والعمليات الصغيرة' },
      { name: 'خزينة الموردين', balance: 20000.00, description: 'لدفع فواتير الموردين' },
      { name: 'خزينة المشاريع', balance: 30000.00, description: 'لتمويل المشاريع المختلفة' }
    ];

    for (const treasury of subTreasuries) {
      const existingTreasury = await pool.query(`
        SELECT id FROM treasuries WHERE name = $1 LIMIT 1
      `, [treasury.name]);

      if (existingTreasury.rows.length === 0) {
        await pool.query(`
          INSERT INTO treasuries (name, type, balance, description) 
          VALUES ($1, 'sub', $2, $3)
        `, [treasury.name, treasury.balance, treasury.description]);
      }
    }

    console.log('✅ Default sub treasuries created');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();