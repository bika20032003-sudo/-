import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all sharshoor logs
router.get('/', (req, res) => {
  try {
    const logs = store.getSharshoor();
    res.json({ success: true, logs });
  } catch (error) {
    res.json({ success: true, logs: [] });
  }
});

// Create new sharshoor log
router.post('/', (req, res) => {
  try {
    const newLog = store.addSharshoor(req.body);
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update sharshoor log
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = store.updateSharshoor(id, req.body);
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete sharshoor log
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteSharshoor(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
