import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import prisma from '../config/database';
import logger from '../utils/logger';

class DriverController {
  // Get driver profile
  async getProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true
            }
          },
          vehicles: true
        }
      });

      if (!driverProfile) {
        return res.status(404).json(
          createErrorResponse('Driver profile not found')
        );
      }

      res.status(200).json(
        createSuccessResponse('Driver profile retrieved successfully', driverProfile)
      );
    } catch (error) {
      logger.error('Get driver profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update driver profile
  async updateProfile(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const {
        aadhaarNumber,
        licenseNumber,
        experienceYears,
        isOnline
      } = req.body;

      // Basic validation
      if (!aadhaarNumber || !licenseNumber || experienceYears === undefined) {
        return res.status(400).json(
          createErrorResponse('Missing required fields: aadhaarNumber, licenseNumber, experienceYears')
        );
      }

      // Check if driver profile already exists
      const existingProfile = await prisma.driverProfile.findUnique({
        where: { userId: req.user.userId }
      });

      let driverProfile;

      if (existingProfile) {
        // Update existing profile
        driverProfile = await prisma.driverProfile.update({
          where: { userId: req.user.userId },
          data: {
            aadhaarNumber,
            licenseNumber,
            experienceYears: parseInt(experienceYears),
            isOnline: isOnline !== undefined ? isOnline : existingProfile.isOnline
          },
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImage: true
              }
            },
            vehicles: true
          }
        });
        
        logger.info(`Driver profile updated for user: ${req.user.userId}`);
      } else {
        // Create new profile
        driverProfile = await prisma.driverProfile.create({
          data: {
            userId: req.user.userId,
            aadhaarNumber,
            licenseNumber,
            experienceYears: parseInt(experienceYears),
            isOnline: isOnline !== undefined ? isOnline : false,
            isVerified: false
          },
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImage: true
              }
            },
            vehicles: true
          }
        });
        
        logger.info(`Driver profile created for user: ${req.user.userId}`);
      }

      res.status(existingProfile ? 200 : 201).json(
        createSuccessResponse(
          existingProfile ? 'Driver profile updated successfully' : 'Driver profile created successfully',
          driverProfile
        )
      );
    } catch (error) {
      logger.error('Update driver profile error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update online status
  async updateOnlineStatus(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { isOnline } = req.body;

      const driverProfile = await prisma.driverProfile.update({
        where: { userId: req.user.userId },
        data: { isOnline },
        select: {
          id: true,
          isOnline: true,
          user: {
            select: {
              fullName: true
            }
          }
        }
      });

      logger.info(`Driver ${driverProfile.user.fullName} is now ${isOnline ? 'online' : 'offline'}`);

      res.status(200).json(
        createSuccessResponse('Online status updated successfully', driverProfile)
      );
    } catch (error) {
      logger.error('Update online status error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get driver earnings
  async getEarnings(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      res.status(200).json(
        createSuccessResponse('Get earnings functionality not yet implemented')
      );
    } catch (error) {
      logger.error('Get earnings error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get driver trips
  async getTrips(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: req.user.userId }
      });

      if (!driverProfile) {
        return res.status(404).json(
          createErrorResponse('Driver profile not found')
        );
      }

      const trips = await prisma.trip.findMany({
        where: { driverProfileId: driverProfile.id },
        include: {
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              pickupAddress: true,
              dropoffAddress: true,
              estimatedFare: true,
              actualFare: true,
              customer: {
                select: {
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(
        createSuccessResponse('Trips retrieved successfully', trips)
      );
    } catch (error) {
      logger.error('Get trips error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get all drivers (Admin)
  async getAllDrivers(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const drivers = await prisma.driverProfile.findMany({
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              isActive: true
            }
          },
          vehicles: {
            select: {
              vehicleType: true,
              vehicleNumber: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
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

  // Get driver by ID (Admin)
  async getDriverById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      res.status(200).json(
        createSuccessResponse('Get driver by ID functionality not yet implemented')
      );
    } catch (error) {
      logger.error('Get driver by ID error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Verify driver (Admin)
  async verifyDriver(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      res.status(200).json(
        createSuccessResponse('Verify driver functionality not yet implemented')
      );
    } catch (error) {
      logger.error('Verify driver error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update driver status (Admin)
  async updateDriverStatus(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!req.user || req.user.role !== 'admin') {
        return res.status(401).json(
          createErrorResponse('Unauthorized: Admin access required')
        );
      }

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Driver ID is required')
        );
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: { isActive },
        include: {
          driverProfile: true
        }
      });

      if (!updatedUser) {
        return res.status(404).json(
          createErrorResponse('Driver not found')
        );
      }

      res.status(200).json(
        createSuccessResponse('Driver status updated successfully', {
          userId: updatedUser.id,
          isActive: updatedUser.isActive,
          driverProfile: updatedUser.driverProfile
        })
      );
    } catch (error) {
      logger.error('Update driver status error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update driver real-time location
  async updateLocation(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { latitude, longitude, address } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json(
          createErrorResponse('Latitude and longitude are required and must be numbers')
        );
      }

      // Get driver profile
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: req.user.userId }
      });

      if (!driverProfile) {
        return res.status(404).json(
          createErrorResponse('Driver profile not found')
        );
      }

      // Update driver location
      const updatedDriverProfile = await prisma.driverProfile.update({
        where: { id: driverProfile.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          currentAddress: address,
          lastLocationUpdate: new Date()
        }
      });

      logger.info(`Driver location updated for driver: ${req.user.userId}`);
      res.status(200).json(
        createSuccessResponse('Location updated successfully', {
          latitude: updatedDriverProfile.currentLatitude,
          longitude: updatedDriverProfile.currentLongitude,
          address: updatedDriverProfile.currentAddress,
          lastUpdate: updatedDriverProfile.lastLocationUpdate
        })
      );
    } catch (error) {
      logger.error('Update driver location error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }
}

export const driverController = new DriverController();
