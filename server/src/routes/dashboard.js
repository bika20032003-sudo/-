import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// Executive Overall Summary
router.get('/summary', (req, res) => {
  try {
    const summary = store.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dedicated Sector Dashboard Summary (Sector A or Sector B)
router.get('/sector/:sectorId', (req, res) => {
  try {
    const { sectorId } = req.params;
    const sectorSummary = store.getSectorSummary(sectorId);
    res.json(sectorSummary);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
