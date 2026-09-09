import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all alerts
router.get('/', (req, res) => {
  try {
    const alerts = store.getAlerts();
    res.json({ success: true, alerts });
  } catch (error) {
    res.json({ success: true, alerts: [] });
  }
});

// Create new alert
router.post('/', (req, res) => {
  try {
    const newAlert = store.addAlert(req.body);
    res.json({ success: true, alert: newAlert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Mark alert as read
router.put('/:id/read', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = store.markAlertAsRead(id);
    res.json({ success: true, alert: updated });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Mark all as read
router.put('/read-all', (req, res) => {
  try {
    store.markAllAlertsAsRead();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
