import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import prisma from '../config/database';
import logger from '../utils/logger';

class NotificationController {
  // Get notifications for user
  async getNotifications(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isRead = req.query.isRead as string;

      const skip = (page - 1) * limit;
      const where: any = { userId: req.user.userId };

      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ 
          where: { 
            userId: req.user.userId, 
            isRead: false 
          } 
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        createSuccessResponse('Notifications retrieved successfully', {
          notifications,
          unreadCount,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          }
        })
      );
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get unread notification count
  async getUnreadCount(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.user.userId,
          isRead: false
        }
      });

      res.status(200).json(
        createSuccessResponse('Unread count retrieved successfully', {
          unreadCount
        })
      );
    } catch (error) {
      logger.error('Get unread count error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Mark notification as read
  async markAsRead(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json(
          createErrorResponse('Notification ID is required')
        );
      }

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification) {
        return res.status(404).json(
          createErrorResponse('Notification not found')
        );
      }

      if (notification.userId !== req.user.userId) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      res.status(200).json(
        createSuccessResponse('Notification marked as read', updatedNotification)
      );
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      await prisma.notification.updateMany({
        where: {
          userId: req.user.userId,
          isRead: false
        },
        data: { isRead: true }
      });

      res.status(200).json(
        createSuccessResponse('All notifications marked as read')
      );
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Delete notification
  async deleteNotification(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json(
          createErrorResponse('Notification ID is required')
        );
      }

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification) {
        return res.status(404).json(
          createErrorResponse('Notification not found')
        );
      }

      if (notification.userId !== req.user.userId) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      res.status(200).json(
        createSuccessResponse('Notification deleted successfully')
      );
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }
}

export const notificationController = new NotificationController();
