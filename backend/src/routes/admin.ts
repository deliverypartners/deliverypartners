import express from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Dashboard and statistics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// Driver management
router.get('/drivers', adminController.getAllDrivers);

// Reports
router.get('/reports/bookings', adminController.getBookingReport);
router.get('/reports/earnings', adminController.getEarningsReport);
router.get('/reports/drivers', adminController.getDriverReport);

// System management
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/backup', adminController.createBackup);

export default router;
