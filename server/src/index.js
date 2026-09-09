import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { store } from './store.js';
import reportRoutes from './routes/reports.js';
import planRoutes from './routes/plans.js';
import equipmentRoutes from './routes/equipment.js';
import fuelRoutes from './routes/fuel.js';
import crushersRoutes from './routes/crushers.js';
import sharshoorRoutes from './routes/sharshoor.js';
import usersRoutes from './routes/users.js';
import alertsRoutes from './routes/alerts.js';
import analysisRoutes from './routes/analysis.js';
import roadProgressRoutes from './routes/roadProgress.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/crushers', crushersRoutes);
app.use('/api/sharshoor', sharshoorRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/road-progress', roadProgressRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    stack: 'High-Performance Hybrid (Express.js, FastPersistentStore, React.js, Node.js)', 
    mysqlConnected: store.isMySQLConnected,
    mode: store.isMySQLConnected ? 'MySQL Connected' : 'High-Speed Persistent Store (Active)',
    message: 'Backend server is running with ultra-low latency response times' 
  });
});

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

// Serve static frontend in cloud / production when dist is built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`[Server] High-performance server running on http://localhost:${port}`);
});

