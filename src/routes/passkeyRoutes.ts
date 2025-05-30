import express from 'express';
import {
  deletePasskeyHandler,
  generateAuthenticationOptionsHandler,
  generateRegistrationOptionsHandler,
  listPasskeysHandler,
  verifyAuthenticationHandler,
  verifyRegistrationHandler,
} from '../controllers/passkeyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate-authentication-options', generateAuthenticationOptionsHandler);
router.post('/verify-authentication', verifyAuthenticationHandler);
router.use(authMiddleware);
router.post('/generate-registration-options', generateRegistrationOptionsHandler);
router.post('/verify-registration', verifyRegistrationHandler);
router.get('/list', listPasskeysHandler);
router.delete('/:id', deletePasskeyHandler);

export default router;
