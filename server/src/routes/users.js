import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all users
router.get('/', (req, res) => {
  try {
    const users = store.getUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: true, users: [] });
  }
});

// Create new user
router.post('/', (req, res) => {
  try {
    const newUser = store.addUser(req.body);
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إنشاء المستخدم' });
  }
});

// Edit / Update existing user
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = store.updateUser(id, req.body);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    store.deleteUser(id);
    res.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحذف' });
  }
});

export default router;
