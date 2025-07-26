import express from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validation';
import { updateUserSchema } from '../utils/validation';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update current user profile
router.put('/profile', validateBody(updateUserSchema), userController.updateProfile);

// Customer profile management
router.post('/customer-profile', userController.createCustomerProfile);
router.get('/customer-profile', userController.getCustomerProfile);

// Admin only routes
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN'), userController.getUserById);
router.put('/:id/status', authorize('ADMIN', 'SUPER_ADMIN'), userController.updateUserStatus);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), userController.deleteUser);

export default router;
