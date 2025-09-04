const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vaults', require('./routes/vaults'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API Health Check
app.get('/api', (req, res) => {
  res.json({ message: 'Hierarchical Vault API' });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});