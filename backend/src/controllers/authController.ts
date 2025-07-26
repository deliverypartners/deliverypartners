import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import logger from '../utils/logger';
import prisma from '../config/database';

class AuthController {
  // Register new user
  async register(req: Request, res: Response): Promise<Response | void> {
    try {
      const { fullName, email, phoneNumber, password, role = 'CUSTOMER' } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { phoneNumber }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json(
          createErrorResponse('User already exists with this email or phone number')
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      });

      // If user is a driver, create driver profile
      if (role === 'DRIVER') {
        await prisma.driverProfile.create({
          data: {
            userId: user.id,
            aadhaarNumber: `TEMP_${user.id}`, // Temporary unique value
            licenseNumber: `TEMP_${user.id}`, // Temporary unique value
            experienceYears: 0, // Will be updated later
            isOnline: false,
            isVerified: false,
            rating: 0,
            totalTrips: 0,
            totalEarnings: 0,
            walletBalance: 0,
          }
        });
        
        logger.info(`Driver profile created for user: ${user.email}`);
      }

      // If user is a customer, create customer profile
      if (role === 'CUSTOMER') {
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            preferredPaymentMethod: 'CASH',
            loyaltyPoints: 0,
          }
        });
        
        logger.info(`Customer profile created for user: ${user.email}`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as jwt.SignOptions
      );

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json(
        createSuccessResponse('User registered successfully', {
          user,
          token,
        })
      );
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during registration')
      );
    }
  }

  // Login user
  async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(401).json(
          createErrorResponse('Invalid email or password')
        );
      }

      if (!user.isActive) {
        return res.status(401).json(
          createErrorResponse('Account is deactivated. Please contact support.')
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(
          createErrorResponse('Invalid email or password')
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as jwt.SignOptions
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${user.email}`);

      res.status(200).json(
        createSuccessResponse('Login successful', {
          user: userWithoutPassword,
          token,
        })
      );
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during login')
      );
    }
  }

  // Logout user (client-side token removal)
  async logout(req: Request, res: Response): Promise<Response | void> {
    try {
      res.status(200).json(
        createSuccessResponse('Logout successful')
      );
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during logout')
      );
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response): Promise<Response | void> {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json(
          createErrorResponse('Token is required')
        );
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json(
          createErrorResponse('Invalid token or user not found')
        );
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as jwt.SignOptions
      );

      res.status(200).json(
        createSuccessResponse('Token refreshed successfully', {
          user,
          token: newToken,
        })
      );
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json(
        createErrorResponse('Invalid or expired token')
      );
    }
  }

  // Verify email (placeholder implementation)
  async verifyEmail(req: Request, res: Response): Promise<Response | void> {
    try {
      const { token } = req.body;

      // TODO: Implement email verification logic
      // This would typically involve checking a verification token
      // and updating the user's isEmailVerified status

      res.status(200).json(
        createSuccessResponse('Email verification functionality not yet implemented')
      );
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during email verification')
      );
    }
  }

  // Forgot password (placeholder implementation)
  async forgotPassword(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      });

      if (!user) {
        // Don't reveal whether user exists for security
        return res.status(200).json(
          createSuccessResponse('If the email exists, a reset link has been sent')
        );
      }

      // TODO: Implement forgot password logic
      // This would typically involve:
      // 1. Generate a reset token
      // 2. Save it to database with expiration
      // 3. Send email with reset link

      res.status(200).json(
        createSuccessResponse('If the email exists, a reset link has been sent')
      );
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during password reset request')
      );
    }
  }

  // Reset password (placeholder implementation)
  async resetPassword(req: Request, res: Response): Promise<Response | void> {
    try {
      const { token, password } = req.body;

      // TODO: Implement reset password logic
      // This would typically involve:
      // 1. Verify the reset token
      // 2. Check if it's not expired
      // 3. Hash the new password
      // 4. Update user's password
      // 5. Invalidate the reset token

      res.status(200).json(
        createSuccessResponse('Password reset functionality not yet implemented')
      );
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error during password reset')
      );
    }
  }
}

export const authController = new AuthController();
