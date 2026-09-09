import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all fuel dispatches
router.get('/', (req, res) => {
  try {
    const logs = store.getFuel();
    res.json({ success: true, logs });
  } catch (error) {
    res.json({ success: true, logs: [] });
  }
});

// Create new fuel dispatch
router.post('/', (req, res) => {
  try {
    const newLog = store.addFuel(req.body);
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update fuel dispatch
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = store.updateFuel(id, req.body);
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete fuel dispatch
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteFuel(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
