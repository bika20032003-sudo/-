import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all fuel dispatches
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.fuelDispatchLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching fuel logs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new fuel dispatch
router.post('/', async (req, res) => {
  try {
    const { ticketNumber, equipmentName, liters, driverName, pumpOperator, tankSource, meterBefore, meterAfter, notes, imageUrl } = req.body;
    
    const newLog = await prisma.fuelDispatchLog.create({
      data: {
        ticketNumber,
        equipmentName,
        liters: Number(liters) || 0,
        driverName,
        pumpOperator,
        tankSource,
        meterBefore: meterBefore ? Number(meterBefore) : null,
        meterAfter: meterAfter ? Number(meterAfter) : null,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error creating fuel log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update fuel dispatch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketNumber, equipmentName, liters, driverName, pumpOperator, tankSource, meterBefore, meterAfter, notes, imageUrl } = req.body;
    
    const updated = await prisma.fuelDispatchLog.update({
      where: { id: Number(id) },
      data: {
        ticketNumber,
        equipmentName,
        liters: Number(liters) || 0,
        driverName,
        pumpOperator,
        tankSource,
        meterBefore: meterBefore ? Number(meterBefore) : null,
        meterAfter: meterAfter ? Number(meterAfter) : null,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, log: updated });
  } catch (error) {
    console.error('Error updating fuel log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete fuel dispatch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fuelDispatchLog.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting fuel log:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
