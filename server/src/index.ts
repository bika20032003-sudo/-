import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reports';
import planRoutes from './routes/plans';
import equipmentRoutes from './routes/equipment';
import fuelRoutes from './routes/fuel';
import crushersRoutes from './routes/crushers';
import sharshoorRoutes from './routes/sharshoor';
import usersRoutes from './routes/users';
import alertsRoutes from './routes/alerts';
import analysisRoutes from './routes/analysis';
import roadProgressRoutes from './routes/roadProgress';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
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
  res.json({ status: 'ok', message: 'Server is running with SQLite Database' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port} and http://127.0.0.1:${port}`);
});
