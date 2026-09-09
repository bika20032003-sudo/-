import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all users with auto-seed of the 2 requested directors
router.get('/', async (req, res) => {
  try {
    let users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });

    // Auto-seed if empty
    if (users.length === 0) {
      await prisma.user.createMany({
        data: [
          { name: 'م. عبدالرحمن', email: 'admin', password: 'admin1234', role: 'مدير المشروع' },
          { name: 'م. عبدالسلام', email: 'admin_sectors', password: 'admin1234', role: 'مدير القطاعات' }
        ]
      });
      users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
      });
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || 'user_' + Date.now(),
        password: password || 'admin1234',
        role: role || 'مستخدم ميداني'
      }
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Edit / Update existing user
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(password ? { password } : {}),
        ...(role ? { role } : {})
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
