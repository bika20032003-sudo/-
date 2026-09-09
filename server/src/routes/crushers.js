import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all crusher logs
router.get('/', (req, res) => {
  try {
    const logs = store.getCrushers();
    res.json({ success: true, logs });
  } catch (error) {
    res.json({ success: true, logs: [] });
  }
});

// Create new crusher log
router.post('/', (req, res) => {
  try {
    const newLog = store.addCrusher(req.body);
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update crusher log
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = store.updateCrusher(id, req.body);
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete crusher log
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteCrusher(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
