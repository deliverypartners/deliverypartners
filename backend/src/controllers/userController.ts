import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import prisma from '../config/database';
import logger from '../utils/logger';

class UserController {
  // Get current user profile
  async getProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          profileImage: true,
          dateOfBirth: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found')
        );
      }

      res.status(200).json(
        createSuccessResponse('Profile retrieved successfully', user)
      );
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update current user profile
  async updateProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { fullName, email, phoneNumber, profileImage, dateOfBirth } = req.body;

      // Check if email or phone is already taken by another user
      if (email || phoneNumber) {
        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: req.user.userId } },
              {
                OR: [
                  ...(email ? [{ email }] : []),
                  ...(phoneNumber ? [{ phoneNumber }] : [])
                ]
              }
            ]
          }
        });

        if (existingUser) {
          return res.status(400).json(
            createErrorResponse('Email or phone number already in use')
          );
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(phoneNumber && { phoneNumber }),
          ...(profileImage && { profileImage }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          profileImage: true,
          dateOfBirth: true,
          updatedAt: true,
        }
      });

      logger.info(`User profile updated: ${updatedUser.email}`);

      res.status(200).json(
        createSuccessResponse('Profile updated successfully', updatedUser)
      );
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get all users (Admin only)
  async getAllUsers(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as string;
      const search = req.query.search as string;

      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        createSuccessResponse('Users retrieved successfully', {
          users,
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
      logger.error('Get all users error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get user by ID (Admin only)
  async getUserById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('User ID is required')
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          profileImage: true,
          dateOfBirth: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found')
        );
      }

      res.status(200).json(
        createSuccessResponse('User retrieved successfully', user)
      );
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update user status (Admin only)
  async updateUserStatus(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('User ID is required')
        );
      }

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
        }
      });

      logger.info(`User status updated: ${user.email} - Active: ${user.isActive}`);

      res.status(200).json(
        createSuccessResponse('User status updated successfully', user)
      );
    } catch (error) {
      logger.error('Update user status error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Delete user (Admin only)
  async deleteUser(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('User ID is required')
        );
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found')
        );
      }

      // Prevent deletion of super admin users
      if (user.role === 'SUPER_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Cannot delete super admin user')
        );
      }

      await prisma.user.delete({
        where: { id }
      });

      logger.info(`User deleted: ${user.email}`);

      res.status(200).json(
        createSuccessResponse('User deleted successfully')
      );
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Create or update customer profile
  async createCustomerProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is a customer
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true }
      });

      if (!user || user.role !== 'CUSTOMER') {
        return res.status(403).json(
          createErrorResponse('Only customers can create customer profiles')
        );
      }

      const { preferredPaymentMethod, defaultAddress, loyaltyPoints } = req.body;

      // Check if customer profile already exists
      const existingProfile = await prisma.customerProfile.findUnique({
        where: { userId: req.user.userId }
      });

      let customerProfile;

      if (existingProfile) {
        // Update existing profile
        customerProfile = await prisma.customerProfile.update({
          where: { userId: req.user.userId },
          data: {
            preferredPaymentMethod,
            defaultAddress,
            loyaltyPoints: loyaltyPoints || existingProfile.loyaltyPoints
          }
        });
      } else {
        // Create new profile
        customerProfile = await prisma.customerProfile.create({
          data: {
            userId: req.user.userId,
            preferredPaymentMethod,
            defaultAddress,
            loyaltyPoints: loyaltyPoints || 0
          }
        });
      }

      logger.info(`Customer profile ${existingProfile ? 'updated' : 'created'} for user: ${req.user.userId}`);

      res.status(existingProfile ? 200 : 201).json(
        createSuccessResponse(
          `Customer profile ${existingProfile ? 'updated' : 'created'} successfully`, 
          customerProfile
        )
      );
    } catch (error) {
      logger.error('Create/update customer profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get customer profile
  async getCustomerProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!customerProfile) {
        return res.status(404).json(
          createErrorResponse('Customer profile not found')
        );
      }

      res.status(200).json(
        createSuccessResponse('Customer profile retrieved successfully', customerProfile)
      );
    } catch (error) {
      logger.error('Get customer profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }
}

export const userController = new UserController();
