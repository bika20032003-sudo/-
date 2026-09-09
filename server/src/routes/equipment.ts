import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new equipment
router.post('/', async (req, res) => {
  try {
    const { code, name, type, category, status, driver, location, dailyHours, fuelConsumptionRate, notes, imageUrl } = req.body;
    
    const newEquipment = await prisma.equipment.create({
      data: {
        code,
        name,
        type,
        category,
        status: status || 'operational',
        driver,
        location,
        dailyHours: Number(dailyHours) || 0,
        fuelConsumptionRate: Number(fuelConsumptionRate) || 0,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, equipment: newEquipment });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, category, status, driver, location, dailyHours, fuelConsumptionRate, notes, imageUrl } = req.body;
    
    const updated = await prisma.equipment.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        type,
        category,
        status: status || 'operational',
        driver,
        location,
        dailyHours: Number(dailyHours) || 0,
        fuelConsumptionRate: Number(fuelConsumptionRate) || 0,
        imageUrl: imageUrl || null,
        notes
      }
    });
    
    res.json({ success: true, equipment: updated });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.equipment.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
