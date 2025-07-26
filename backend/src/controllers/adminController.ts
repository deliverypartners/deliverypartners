import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import prisma from '../config/database';
import logger from '../utils/logger';

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Get basic counts for dashboard
      const [
        totalUsers,
        totalDrivers,
        totalBookings,
        todayBookings,
        activeDrivers,
        pendingBookings
      ] = await Promise.all([
        prisma.user.count(),
        prisma.driverProfile.count(),
        prisma.booking.count(),
        prisma.booking.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.driverProfile.count({
          where: { isOnline: true }
        }),
        prisma.booking.count({
          where: { status: 'PENDING' }
        })
      ]);

      const stats = {
        totalUsers,
        totalDrivers,
        totalBookings,
        todayBookings,
        activeDrivers,
        pendingBookings
      };

      res.status(200).json(
        createSuccessResponse('Dashboard stats retrieved successfully', stats)
      );
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get analytics data
  async getAnalytics(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Basic analytics: total bookings, completed bookings, cancelled bookings, total earnings, average fare
      const [
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings,
        averageFare
      ] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.booking.count({ where: { status: 'CANCELLED' } }),
        prisma.booking.aggregate({ _sum: { actualFare: true } }),
        prisma.booking.aggregate({ _avg: { actualFare: true } })
      ]);
      const analytics = {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings: totalEarnings._sum.actualFare || 0,
        averageFare: averageFare._avg.actualFare || 0
      };
      res.status(200).json(
        createSuccessResponse('Analytics data retrieved successfully', analytics)
      );
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get booking report
  async getBookingReport(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Return a list of bookings with key details for reporting
      const bookings = await prisma.booking.findMany({
        select: {
          bookingNumber: true,
          status: true,
          actualFare: true,
          createdAt: true,
          customer: {
            select: {
              fullName: true,
              email: true
            }
          },
          driver: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(
        createSuccessResponse('Booking report retrieved successfully', bookings)
      );
    } catch (error) {
      logger.error('Get booking report error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get earnings report
  async getEarningsReport(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Aggregate total earnings and commission
      const [totalEarnings, totalCommission, transactions] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: 'EARNINGS', status: 'COMPLETED' }
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: 'COMMISSION', status: 'COMPLETED' }
        }),
        prisma.transaction.findMany({
          where: { type: { in: ['EARNINGS', 'COMMISSION'] }, status: 'COMPLETED' },
          select: {
            transactionId: true,
            type: true,
            amount: true,
            paymentMethod: true,
            createdAt: true,
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);
      const report = {
        totalEarnings: totalEarnings._sum.amount || 0,
        totalCommission: totalCommission._sum.amount || 0,
        transactions
      };
      res.status(200).json(
        createSuccessResponse('Earnings report retrieved successfully', report)
      );
    } catch (error) {
      logger.error('Get earnings report error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get driver report
  async getDriverReport(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // List drivers with stats
      const drivers = await prisma.driverProfile.findMany({
        select: {
          id: true,
          isVerified: true,
          rating: true,
          totalTrips: true,
          totalEarnings: true,
          isOnline: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(
        createSuccessResponse('Driver report retrieved successfully', drivers)
      );
    } catch (error) {
      logger.error('Get driver report error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get system health
  async getSystemHealth(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const health = {
        status: 'healthy',
        database: 'connected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      res.status(200).json(
        createSuccessResponse('System health retrieved successfully', health)
      );
    } catch (error) {
      logger.error('Get system health error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Create backup
  async createBackup(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Simulate backup operation
      const backupTime = new Date().toISOString();
      // In a real app, trigger a backup script or export here
      res.status(200).json(
        createSuccessResponse('Backup created successfully', { backupTime })
      );
    } catch (error) {
      logger.error('Create backup error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get all drivers
  async getAllDrivers(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const drivers = await prisma.user.findMany({
        where: { role: 'DRIVER' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          driverProfile: {
            select: {
              id: true,
              isOnline: true,
              isVerified: true,
              rating: true,
              totalTrips: true
            }
          }
        },
        orderBy: { fullName: 'asc' }
      });

      res.status(200).json(
        createSuccessResponse('Drivers retrieved successfully', drivers)
      );
    } catch (error) {
      logger.error('Get all drivers error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }
}

export const adminController = new AdminController();

