import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Backup & Resilience endpoints
app.get('/api/backup/export', (req, res) => {
  res.json({ 
    success: true, 
    app: 'منظومة جهاز الإشراف والمتابعة - صيانة طريق أوباري غات (360 كم)',
    timestamp: new Date().toISOString(),
    data: store.data 
  });
});

app.post('/api/backup/restore', (req, res) => {
  if (req.body && typeof req.body === 'object') {
    store.data = { ...store.data, ...req.body };
    store.saveToDiskSync();
    res.json({ success: true, message: 'تم استعادة وتحديث قاعدة بيانات السيرفر بنجاح' });
  } else {
    res.status(400).json({ success: false, message: 'ملف أو بيانات غير صالحة' });
  }
});

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
app.use('/api/messages', messagesRoutes);

app.get('/api/executive-progress', (req, res) => {
  const data = store.getExecutiveProgress();
  res.json({ success: true, data });
});

app.post('/api/executive-progress', (req, res) => {
  const updated = store.updateExecutiveProgress(req.body);
  res.json({ success: true, data: updated, message: 'تم تحديث الموقف التنفيذي بنجاح' });
});

app.get('/api/road-daily-report', (req, res) => {
  const data = store.getRoadDailyReport();
  res.json({ success: true, data });
});

app.post('/api/road-daily-report', (req, res) => {
  const updated = store.updateRoadDailyReport(req.body);
  res.json({ success: true, data: updated, message: 'تم تحديث تقرير أعمال الطريق اليومي بنجاح' });
});

app.get('/api/fuel-daily-report', (req, res) => {
  const data = store.getFuelDailyReport();
  res.json({ success: true, data });
});

app.post('/api/fuel-daily-report', (req, res) => {
  const updated = store.updateFuelDailyReport(req.body);
  res.json({ success: true, data: updated, message: 'تم تحديث تقرير كميات الوقود اليومية بنجاح' });
});

app.get('/api/two-phase-report', (req, res) => {
  const data = store.getTwoPhaseReport();
  res.json({ success: true, data });
});

app.post('/api/two-phase-report', (req, res) => {
  const updated = store.updateTwoPhaseReport(req.body);
  res.json({ success: true, data: updated, message: 'تم تحديث تقرير إنجاز المرحلتين بنجاح' });
});

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

