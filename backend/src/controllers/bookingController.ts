import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import prisma from '../config/database';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { emailService } from '../services/emailService';

class BookingController {
  // Create a new booking
  async createBooking(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const {
        serviceType,
        pickupAddress,
        pickupLatitude,
        pickupLongitude,
        dropoffAddress,
        dropoffLatitude,
        dropoffLongitude,
        pickupDateTime,
        estimatedFare,
        notes,
        paymentMethod = 'CASH',
        customerName,
        customerPhone,
        customerType,
        vehicleType,
        vehicleName
      } = req.body;

      // Add validation and logging
      logger.info('Booking creation request:', {
        userId: req.user.userId,
        serviceType,
        pickupAddress,
        dropoffAddress,
        estimatedFare: typeof estimatedFare,
        pickupLatitude: typeof pickupLatitude,
        pickupLongitude: typeof pickupLongitude
      });

      // Validate required fields
      if (!serviceType || !pickupAddress || !dropoffAddress) {
        return res.status(400).json(
          createErrorResponse('Service type, pickup address, and dropoff address are required')
        );
      }

      // Generate unique booking number
      const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const booking = await prisma.booking.create({
        data: {
          customerId: req.user.userId,
          bookingNumber,
          serviceType,
          pickupAddress,
          pickupLatitude: parseFloat(pickupLatitude) || 0,
          pickupLongitude: parseFloat(pickupLongitude) || 0,
          dropoffAddress,
          dropoffLatitude: parseFloat(dropoffLatitude) || 0,
          dropoffLongitude: parseFloat(dropoffLongitude) || 0,
          pickupDateTime: new Date(pickupDateTime),
          estimatedFare: parseFloat(estimatedFare) || 0,
          notes,
          paymentMethod,
          // @ts-ignore - New fields from migration, Prisma client will be regenerated
          vehicleType: vehicleType || null,
          vehicleName: vehicleName || null,
          status: 'PENDING'
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true
            }
          }
        }
      });

      // Create notification for admin (get all admin users)
      const adminUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        },
        select: {
          id: true
        }
      });

      // Create notifications for all admin users
      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New Booking Request',
            message: `New booking request #${bookingNumber} from ${pickupAddress} to ${dropoffAddress}`,
            type: 'BOOKING_CREATED',
            isRead: false
          }
        });
      }

      // 📧 Send email notification to admin
      try {
        const emailData = {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          customerName: booking.customer?.fullName || customerName || 'N/A',
          customerEmail: booking.customer?.email || 'N/A',
          customerPhone: booking.customer?.phoneNumber || customerPhone || 'N/A',
          serviceType: booking.serviceType,
          vehicleName: booking.vehicleName || null,
          pickupAddress: booking.pickupAddress,
          dropoffAddress: booking.dropoffAddress,
          pickupDateTime: booking.pickupDateTime.toISOString(),
          estimatedFare: booking.estimatedFare,
          status: booking.status,
        };

        const emailResult = await emailService.sendBookingNotificationToAdmin(emailData);
        if (emailResult.success) {
          logger.info(`✅ Admin email notification sent for booking: ${booking.bookingNumber}`);
        } else {
          logger.error(`❌ Failed to send admin email for booking: ${booking.bookingNumber}`, emailResult.error);
        }
      } catch (emailError) {
        logger.error('❌ Email notification error:', emailError);
        // Don't fail the booking creation if email fails
      }

      logger.info(`New booking created: ${booking.bookingNumber}`);

      res.status(201).json(
        createSuccessResponse('Booking created successfully', booking)
      );
    } catch (error) {
      logger.error('Create booking error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get user's bookings
  async getMyBookings(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const bookings = await prisma.booking.findMany({
        where: { customerId: req.user.userId },
        include: {
          driver: {
            include: {
              user: {
                select: {
                  id: true,
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
        createSuccessResponse('Bookings retrieved successfully', bookings)
      );
    } catch (error) {
      logger.error('Get my bookings error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get booking by ID
  async getBookingById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      // Check if user has permission to view this booking
      if (req.user.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      if (req.user.role === 'DRIVER' && booking.driverId !== req.user.userId) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      res.status(200).json(
        createSuccessResponse('Booking retrieved successfully', booking)
      );
    } catch (error) {
      logger.error('Get booking by ID error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Cancel booking
  async cancelBooking(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      // Check if user can cancel this booking
      if (req.user.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      logger.info(`Booking ${booking.bookingNumber} cancelled`);

      res.status(200).json(
        createSuccessResponse('Booking cancelled successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Cancel booking error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get available bookings for driver (only assigned to them)
  async getAvailableBookings(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is a driver
      if (req.user.role !== 'DRIVER') {
        return res.status(403).json(
          createErrorResponse('Access denied. Driver privileges required.')
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

      // Only get bookings that are specifically assigned to this driver
      const bookings = await prisma.booking.findMany({
        where: {
          driverId: driverProfile.id,
          status: 'DRIVER_ASSIGNED' // Only trips assigned but not yet accepted
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(
        createSuccessResponse('Available bookings retrieved successfully', bookings)
      );
    } catch (error) {
      logger.error('Get available bookings error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Accept booking (Driver)
  async acceptBooking(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
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

      // First, verify the booking is assigned to this driver and is pending acceptance
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        select: { id: true, status: true, driverId: true }
      });

      if (!existingBooking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      if (existingBooking.driverId !== driverProfile.id) {
        return res.status(403).json(
          createErrorResponse('This booking is not assigned to you')
        );
      }

      if (existingBooking.status !== 'DRIVER_ASSIGNED') {
        return res.status(400).json(
          createErrorResponse('Booking is not available for acceptance')
        );
      }

      // Update booking status to DRIVER_ARRIVED (indicating driver has accepted)
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'DRIVER_ARRIVED'
        },
        include: {
          customer: {
            select: {
              fullName: true,
              phoneNumber: true
            }
          }
        }
      });

      logger.info(`Booking accepted by driver: ${booking.bookingNumber}`);

      res.status(200).json(
        createSuccessResponse('Booking accepted successfully', booking)
      );
    } catch (error) {
      logger.error('Accept booking error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Start trip (Driver)
  async startTrip(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
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
      // Find the booking and check assignment
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { vehicle: true }
      });
      if (!booking || booking.driverId !== driverProfile.id) {
        return res.status(404).json(
          createErrorResponse('Booking not found or not assigned to you')
        );
      }
      if (booking.status !== 'DRIVER_ARRIVED') {
        return res.status(400).json(
          createErrorResponse('Trip cannot be started at this stage')
        );
      }
      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
      // Create trip record
      const trip = await prisma.trip.create({
        data: {
          bookingId: booking.id,
          driverProfileId: driverProfile.id,
          vehicleId: booking.vehicleId || booking.vehicle?.id || '',
          status: 'STARTED',
          startTime: new Date()
        }
      });
      console.log('✅ Trip created successfully:', trip);
      logger.info(`Trip started for booking: ${booking.bookingNumber} by driver ${req.user.userId}`);
      res.status(200).json(
        createSuccessResponse('Trip started successfully', { booking: updatedBooking, trip })
      );
    } catch (error) {
      logger.error('Start trip error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Complete trip (Driver)
  async completeTrip(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }
      const { id } = req.params;
      const { actualFare } = req.body;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
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
      // Find the booking and check assignment
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { trip: true }
      });
      if (!booking || booking.driverId !== driverProfile.id) {
        return res.status(404).json(
          createErrorResponse('Booking not found or not assigned to you')
        );
      }
      if (booking.status !== 'IN_PROGRESS') {
        return res.status(400).json(
          createErrorResponse('Trip cannot be completed at this stage')
        );
      }
      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualFare: actualFare || booking.estimatedFare
        }
      });
      // Update trip record
      const updatedTrip = await prisma.trip.update({
        where: { bookingId: booking.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date()
        }
      });
      logger.info(`Trip completed for booking: ${booking.bookingNumber} by driver ${req.user.userId}`);
      res.status(200).json(
        createSuccessResponse('Trip completed successfully', { booking: updatedBooking, trip: updatedTrip })
      );
    } catch (error) {
      logger.error('Complete trip error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update location during trip (Driver)
  async updateLocation(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
        );
      }
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
      // Find the booking and check assignment
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { trip: true }
      });
      if (!booking || booking.driverId !== driverProfile.id) {
        return res.status(404).json(
          createErrorResponse('Booking not found or not assigned to you')
        );
      }
      if (booking.status !== 'IN_PROGRESS') {
        return res.status(400).json(
          createErrorResponse('Trip is not in progress')
        );
      }
      // Update trip location
      const updatedTrip = await prisma.trip.update({
        where: { bookingId: booking.id },
        data: {
          endLatitude: latitude,
          endLongitude: longitude
        }
      });

      // Also update driver's current location for real-time tracking
      await prisma.driverProfile.update({
        where: { id: driverProfile.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date()
        }
      });

      logger.info(`Trip location updated for booking: ${booking.bookingNumber} by driver ${req.user.userId}`);
      res.status(200).json(
        createSuccessResponse('Trip location updated successfully', updatedTrip)
      );
    } catch (error) {
      logger.error('Update location error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Assign driver to booking (Admin only)
  async assignDriver(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Access denied. Admin privileges required.')
        );
      }

      const { bookingId, driverId } = req.body;

      if (!bookingId || !driverId) {
        return res.status(400).json(
          createErrorResponse('Booking ID and Driver ID are required')
        );
      }

      // Check if booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      // Check if driver exists and has vehicles
      const driver = await prisma.driverProfile.findUnique({
        where: { userId: driverId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          vehicles: {
            where: { isActive: true },
            take: 1
          }
        }
      });

      if (!driver) {
        return res.status(404).json(
          createErrorResponse('Driver not found')
        );
      }

      if (!driver.vehicles || driver.vehicles.length === 0) {
        return res.status(400).json(
          createErrorResponse('Driver has no active vehicles')
        );
      }

      // Update booking with assigned driver
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          driverId: driver.id,
          status: 'DRIVER_ASSIGNED'
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      });

      console.log('🔍 assignDriver - About to create trip with data:', {
        bookingId: bookingId,
        driverProfileId: driver.id,
        status: 'STARTED',
        vehicleId: driver.vehicles[0]!.id
      });

      // Create trip record when driver is assigned
      const trip = await prisma.trip.create({
        data: {
          bookingId: bookingId,
          driverProfileId: driver.id,
          status: 'STARTED', // Use valid TripStatus enum value
          vehicleId: driver.vehicles[0]!.id // We already validated vehicles exist above
        }
      });
      console.log('✅ Trip created successfully:', trip);

      // Send notification to driver
      await prisma.notification.create({
        data: {
          userId: driver.user.id,
          title: 'New Booking Assignment',
          message: `You have been assigned to booking #${booking.bookingNumber} from ${booking.pickupAddress} to ${booking.dropoffAddress}`,
          type: 'TRIP_ASSIGNED',
          isRead: false
        }
      });

      // Send notification to customer
      await prisma.notification.create({
        data: {
          userId: booking.customer.id,
          title: 'Driver Assigned',
          message: `Driver ${driver.user.fullName} has been assigned to your booking #${booking.bookingNumber}`,
          type: 'DRIVER_ASSIGNED',
          isRead: false
        }
      });

      logger.info(`Driver ${driver.user.fullName} assigned to booking ${booking.bookingNumber}`);

      res.status(200).json(
        createSuccessResponse('Driver assigned successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Assign driver error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get all bookings for admin
  async getAllBookings(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json(
          createErrorResponse('Access denied. Admin privileges required.')
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (status) {
        where.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true
              }
            },
            driver: {
              select: {
                id: true,
                currentLatitude: true,
                currentLongitude: true,
                currentAddress: true,
                lastLocationUpdate: true,
                user: {
                  select: {
                    fullName: true,
                    phoneNumber: true
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        createSuccessResponse('Bookings retrieved successfully', {
          bookings,
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
      logger.error('Get all bookings error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get driver's assigned bookings
  async getDriverBookings(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is a driver
      if (req.user.role !== 'DRIVER') {
        return res.status(403).json(
          createErrorResponse('Access denied. Driver privileges required.')
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const skip = (page - 1) * limit;
      const where: any = { driverId: driverProfile.id };

      if (status) {
        where.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        createSuccessResponse('Driver bookings retrieved successfully', {
          bookings,
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
      logger.error('Get driver bookings error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update booking status
  async updateBookingStatus(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { bookingId, status } = req.body;

      if (!bookingId || !status) {
        return res.status(400).json(
          createErrorResponse('Booking ID and status are required')
        );
      }

      const validStatuses = ['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(
          createErrorResponse('Invalid status')
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      // Check authorization
      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
      
      // Get driver profile to check if current user is the assigned driver
      let isDriver = false;
      if (req.user.role === 'DRIVER' && booking.driverId) {
        const driverProfile = await prisma.driverProfile.findUnique({
          where: { id: booking.driverId }
        });
        isDriver = driverProfile?.userId === req.user.userId;
      }
      
      const isCustomer = req.user.role === 'CUSTOMER' && booking.customerId === req.user.userId;

      if (!isAdmin && !isDriver && !isCustomer) {
        return res.status(403).json(
          createErrorResponse('Access denied')
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status,
          ...(status === 'PICKED_UP' && { pickedUpAt: new Date() }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() })
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      });

      // Create notification for status update
      const statusMessages = {
        DRIVER_ASSIGNED: 'Your booking has been assigned to a driver',
        DRIVER_ARRIVED: 'Your driver has arrived at pickup location',
        IN_PROGRESS: 'Your item is being delivered',
        COMPLETED: 'Your item has been delivered',
        CANCELLED: 'Your booking has been cancelled'
      };

      if (statusMessages[status as keyof typeof statusMessages]) {
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: 'Booking Status Updated',
            message: statusMessages[status as keyof typeof statusMessages],
            type: 'BOOKING_CONFIRMED',
            isRead: false
          }
        });
      }

      logger.info(`Booking ${bookingId} status updated to ${status}`);

      res.status(200).json(
        createSuccessResponse('Booking status updated successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Update booking status error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Reject booking (Driver only)
  async rejectBooking(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      if (req.user.role !== 'DRIVER') {
        return res.status(403).json(
          createErrorResponse('Access denied. Driver privileges required.')
        );
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
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

      // Check if this booking is assigned to this driver
      if (booking.driverId !== driverProfile.id) {
        return res.status(403).json(
          createErrorResponse('This booking is not assigned to you')
        );
      }

      // Remove driver assignment and set back to pending
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { 
          driverId: null,
          status: 'PENDING'
        }
      });

      // Notify admins about the rejection
      const adminUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        },
        select: {
          id: true
        }
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Booking Rejected by Driver',
            message: `Booking #${booking.bookingNumber} was rejected by driver and needs reassignment`,
            type: 'STATUS_UPDATE',
            isRead: false
          }
        });
      }

      logger.info(`Booking rejected by driver: ${booking.bookingNumber}`);

      res.status(200).json(
        createSuccessResponse('Booking rejected successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Reject booking error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Get active trips for driver (accepted and in progress)
  async getActiveTrips(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      // Check if user is a driver
      if (req.user.role !== 'DRIVER') {
        return res.status(403).json(
          createErrorResponse('Access denied. Driver privileges required.')
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

      // Get bookings that are assigned to this driver and in active states
      const activeTrips = await prisma.booking.findMany({
        where: {
          driverId: driverProfile.id,
          status: {
            in: ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS']
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(
        createSuccessResponse('Active trips retrieved successfully', activeTrips)
      );
    } catch (error) {
      logger.error('Get active trips error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Mark driver as arrived at pickup location
  async markDriverArrived(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
        );
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json(
          createErrorResponse('Booking ID is required')
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

      // Find the booking and check assignment
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              fullName: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!booking || booking.driverId !== driverProfile.id) {
        return res.status(404).json(
          createErrorResponse('Booking not found or not assigned to you')
        );
      }

      if (booking.status !== 'DRIVER_ASSIGNED') {
        return res.status(400).json(
          createErrorResponse('Invalid booking status for this action')
        );
      }

      // Update booking status to DRIVER_ARRIVED
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'DRIVER_ARRIVED' }
      });

      logger.info(`Driver marked as arrived for booking: ${booking.bookingNumber}`);

      res.status(200).json(
        createSuccessResponse('Driver marked as arrived successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Mark driver arrived error:', error);
      res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Update trip status by driver
  async updateTripStatusByDriver(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const { id: bookingId } = req.params;
      const { status } = req.body;

      if (!req.user || !bookingId) {
        return res.status(401).json(
          createErrorResponse('Authentication required')
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

      // Validate status
      const validStatuses = ['IN_PROGRESS', 'COMPLETED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(
          createErrorResponse('Invalid status')
        );
      }

      // Get the booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          driver: true
        }
      });

      if (!booking) {
        return res.status(404).json(
          createErrorResponse('Booking not found')
        );
      }

      // Check if this driver is assigned to this booking
      if (booking.driverId !== driverProfile.id) {
        return res.status(403).json(
          createErrorResponse('You are not assigned to this booking')
        );
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        'DRIVER_ASSIGNED': ['IN_PROGRESS'],
        'IN_PROGRESS': ['COMPLETED']
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        return res.status(400).json(
          createErrorResponse(`Cannot transition from ${booking.status} to ${status}`)
        );
      }

      // Update booking status based on trip status
      const bookingStatusMap: Record<string, any> = {
        'IN_PROGRESS': 'IN_PROGRESS',
        'COMPLETED': 'COMPLETED'
      };

      const newBookingStatus = bookingStatusMap[status] || booking.status;

      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: newBookingStatus as any }
      });

      // Update trip record
      const trip = await prisma.trip.findFirst({
        where: { 
          bookingId: bookingId,
          driverProfileId: driverProfile.id 
        }
      });

      if (trip) {
        const updatedTrip = await prisma.trip.update({
          where: { id: trip.id },
          data: { 
            status: status as any // Use the status directly since it's already validated
          }
        });
      }

      logger.info('Trip status updated by driver:', {
        bookingId,
        driverId: driverProfile.id,
        oldStatus: booking.status,
        newStatus: status
      });

      return res.status(200).json(
        createSuccessResponse('Trip status updated successfully', updatedBooking)
      );
    } catch (error) {
      logger.error('Error updating trip status by driver:', error);
      return res.status(500).json(
        createErrorResponse('Internal server error')
      );
    }
  }

  // Test email notification endpoint
  async testEmailNotification(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Test email connection
      const isConnected = await emailService.testEmailConnection();
      
      if (!isConnected) {
        return res.status(500).json(
          createErrorResponse('Email service connection failed')
        );
      }

      // Send test booking email
      const result = await emailService.sendTestEmail();

      res.status(200).json(
        createSuccessResponse('Test email sent successfully', result)
      );

    } catch (error: any) {
      logger.error('Email test error:', error);
      res.status(500).json(
        createErrorResponse('Email test failed', error?.message)
      );
    }
  }
}

export const bookingController = new BookingController();
