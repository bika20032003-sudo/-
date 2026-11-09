import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// GET /api/messages?username=...
router.get('/', (req, res) => {
  try {
    const { username } = req.query;
    const messages = store.getMessages(username);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب المراسلات' });
  }
});

// POST /api/messages
router.post('/', (req, res) => {
  try {
    const message = store.addMessage(req.body);
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ success: false, message: 'خطأ في إرسال المراسلة' });
  }
});

// PUT /api/messages/:id/read
router.put('/:id/read', (req, res) => {
  try {
    const { username } = req.query;
    const message = store.markMessageRead(req.params.id, username);
    if (message) {
      res.json({ success: true, message });
    } else {
      res.status(404).json({ success: false, message: 'الرسالة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث حالة الرسالة' });
  }
});

// DELETE /api/messages/clear-all or DELETE /api/messages
router.delete('/clear-all', (req, res) => {
  try {
    const { username, box } = req.query;
    store.clearAllMessages(username, box);
    res.json({ success: true, message: 'تم تفريغ المراسلات بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تفريغ المراسلات' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', (req, res) => {
  try {
    const { username } = req.query;
    store.deleteMessage(req.params.id, username);
    res.json({ success: true, message: 'تم حذف المراسلة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف الرسالة' });
  }
});

export default router;
