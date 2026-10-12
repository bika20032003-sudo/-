import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile
} from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/profile', updateProfile);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
