import express from 'express';
import { driverController } from '../controllers/driverController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

// Driver self-management routes
router.get('/profile', authorize('DRIVER'), driverController.getProfile);
router.put('/profile', authorize('DRIVER'), driverController.updateProfile);
router.put('/status', authorize('DRIVER'), driverController.updateOnlineStatus);
router.put('/location', authorize('DRIVER'), driverController.updateLocation);
router.get('/earnings', authorize('DRIVER'), driverController.getEarnings);
router.get('/trips', authorize('DRIVER'), driverController.getTrips);

// Admin routes
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), driverController.getAllDrivers);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN'), driverController.getDriverById);
router.put('/:id/verify', authorize('ADMIN', 'SUPER_ADMIN'), driverController.verifyDriver);
router.put('/:id/status', authorize('ADMIN', 'SUPER_ADMIN'), driverController.updateDriverStatus);

export default router;
