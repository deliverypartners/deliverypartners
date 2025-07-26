import express from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications for user
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
