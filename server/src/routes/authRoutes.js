import { Router } from 'express';
import { login, getProfile, getSystemStatus } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.get('/me', getProfile);
router.get('/status', getSystemStatus);

export default router;
