import { Router } from 'express';
import {
  register,
  login,
  // generateRegistrationOptionsHandler,
  // verifyRegistrationHandler,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/init-register', authMiddleware, generateRegistrationOptionsHandler);
// router.post('/verify-register', authMiddleware, verifyRegistrationHandler);

export default router;
