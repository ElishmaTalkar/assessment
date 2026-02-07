import { Router } from 'express';
import { signup, login, getMe, refreshToken, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { signupValidation, loginValidation } from '../middleware/validation.middleware';

const router = Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
