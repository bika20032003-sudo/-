import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all sharshoor logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.sharshoorLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching sharshoor logs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new sharshoor log
router.post('/', async (req, res) => {
  try {
    const { sector, crusher, amountTons, truckCode, destination, notes, imageUrl } = req.body;
    
    const newLog = await prisma.sharshoorLog.create({
      data: {
        sector,
        crusher,
        amountTons: Number(amountTons) || 0,
        truckCode,
        destination,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error creating sharshoor log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update sharshoor log
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sector, crusher, amountTons, truckCode, destination, notes, imageUrl } = req.body;
    
    const updated = await prisma.sharshoorLog.update({
      where: { id: Number(id) },
      data: {
        sector,
        crusher,
        amountTons: Number(amountTons) || 0,
        truckCode,
        destination,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: updated });
  } catch (error) {
    console.error('Error updating sharshoor log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete sharshoor log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sharshoorLog.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sharshoor log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
