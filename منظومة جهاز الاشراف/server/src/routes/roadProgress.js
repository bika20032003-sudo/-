import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// GET /api/road-progress
router.get('/', (req, res) => {
  try {
    const { sector } = req.query;
    const progress = store.getRoadProgress(sector || 'all');
    res.json(progress);
  } catch (error) {
    console.error('Error fetching road progress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/road-progress/update-daily
router.post('/update-daily', (req, res) => {
  try {
    const { id, todayMeters, notes } = req.body;
    const updated = store.updateRoadProgressItem(id, todayMeters, notes);
    if (updated) {
      res.json({ success: true, updated });
    } else {
      res.json({ success: true, message: 'تم تحديث المنجز بنجاح' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التحديث' });
  }
});

export default router;
