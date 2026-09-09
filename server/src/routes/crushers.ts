import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all crusher logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.crusherLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching crusher logs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new crusher log
router.post('/', async (req, res) => {
  try {
    const { name, sector, dailyProductionTons, sharshoorTons, notes, imageUrl } = req.body;
    
    const newLog = await prisma.crusherLog.create({
      data: {
        name,
        sector,
        dailyProductionTons: Number(dailyProductionTons) || 0,
        sharshoorTons: Number(sharshoorTons) || 0,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error creating crusher log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update crusher log
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sector, dailyProductionTons, sharshoorTons, notes, imageUrl } = req.body;
    
    const updated = await prisma.crusherLog.update({
      where: { id: Number(id) },
      data: {
        name,
        sector,
        dailyProductionTons: Number(dailyProductionTons) || 0,
        sharshoorTons: Number(sharshoorTons) || 0,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: updated });
  } catch (error) {
    console.error('Error updating crusher log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete crusher log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.crusherLog.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting crusher log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
