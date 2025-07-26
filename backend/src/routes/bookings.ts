import express from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/cancel', bookingController.cancelBooking);

// Driver routes
router.get('/driver/my-bookings', authorize('DRIVER'), bookingController.getDriverBookings);
router.get('/driver/available', authorize('DRIVER'), bookingController.getAvailableBookings);
router.get('/driver/active', authorize('DRIVER'), bookingController.getActiveTrips);
router.put('/:id/accept', authorize('DRIVER'), bookingController.acceptBooking);
router.put('/:id/reject', authorize('DRIVER'), bookingController.rejectBooking);
router.put('/:id/arrived', authorize('DRIVER'), bookingController.markDriverArrived);
router.put('/:id/start', authorize('DRIVER'), bookingController.startTrip);
router.put('/:id/complete', authorize('DRIVER'), bookingController.completeTrip);
router.put('/:id/update-location', authorize('DRIVER'), bookingController.updateLocation);

// Admin routes
router.get('/admin/all', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.getAllBookings);
router.post('/admin/assign-driver', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.assignDriver);
router.put('/admin/status', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.updateBookingStatus);

// Driver routes for trip status updates
router.put('/:id/driver-status', authorize('DRIVER'), bookingController.updateTripStatusByDriver);

// Test email route (Admin only)
router.post('/test-email', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.testEmailNotification);

// Legacy admin routes (keeping for backward compatibility)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.getAllBookings);
router.put('/:id/assign-driver', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.assignDriver);
router.put('/:id/status', authorize('ADMIN', 'SUPER_ADMIN'), bookingController.updateBookingStatus);

export default router;
