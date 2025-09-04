import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
import authRoutes from './routes/auth.js';
import vaultRoutes from './routes/vaults.js';
import projectRoutes from './routes/projects.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';

app.use('/api/auth', authRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

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