import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const { type, title, message } = req.body;
    
    const newAlert = await prisma.alert.create({
      data: {
        type: type || 'info',
        title,
        message,
        isRead: false
      }
    });
    
    res.json({ success: true, alert: newAlert });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Mark alert as read
router.put('/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: { isRead: true }
    });
    res.json({ success: true, alert: updatedAlert });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating alerts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
