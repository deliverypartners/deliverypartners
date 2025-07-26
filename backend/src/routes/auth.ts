import express from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validation';
import { loginSchema, registerSchema } from '../utils/validation';

const router = express.Router();

// Auth routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
