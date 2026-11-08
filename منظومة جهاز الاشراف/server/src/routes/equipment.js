import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all equipment
router.get('/', (req, res) => {
  try {
    const equipment = store.getEquipment();
    res.json({ success: true, equipment });
  } catch (error) {
    res.json({ success: true, equipment: [] });
  }
});

// Create new equipment
router.post('/', (req, res) => {
  try {
    const newEquipment = store.addEquipment(req.body);
    res.json({ success: true, equipment: newEquipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update equipment
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = store.updateEquipment(id, req.body);
    res.json({ success: true, equipment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete equipment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteEquipment(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
