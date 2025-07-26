import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Prisma client - regenerated after schema changes
const prisma = new PrismaClient() as any; // Temporary workaround for TypeScript issue

// Validation schemas
const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be at most 20 characters'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0, 'Discount value must be positive'),
  maxDiscount: z.number().min(0, 'Max discount must be positive').optional(),
  validFrom: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  validTo: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  usageLimitPerUser: z.number().min(1, 'Usage limit must be at least 1').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const updateCouponSchema = createCouponSchema.partial();

// Get all coupons with pagination and filtering
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && ['ACTIVE', 'INACTIVE'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.code = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

// Get a single coupon by ID
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
};

// Create a new coupon
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createCouponSchema.parse(req.body);

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code }
    });

    if (existingCoupon) {
      res.status(400).json({ error: 'Coupon code already exists' });
      return;
    }

    // Validate date range
    const validFrom = new Date(validatedData.validFrom);
    const validTo = new Date(validatedData.validTo);

    if (validFrom >= validTo) {
      res.status(400).json({ error: 'Valid from date must be before valid to date' });
      return;
    }

    // For percentage discounts, validate that discount value is <= 100
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...validatedData,
        validFrom,
        validTo,
      }
    });

    res.status(201).json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
      return;
    }
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

// Update a coupon
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateCouponSchema.parse(req.body);

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existingCoupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    // If updating code, check for duplicates
    if (validatedData.code && validatedData.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: validatedData.code }
      });

      if (codeExists) {
        res.status(400).json({ error: 'Coupon code already exists' });
        return;
      }
    }

    // Validate dates if both are provided
    if (validatedData.validFrom && validatedData.validTo) {
      const validFrom = new Date(validatedData.validFrom);
      const validTo = new Date(validatedData.validTo);

      if (validFrom >= validTo) {
        res.status(400).json({ error: 'Valid from date must be before valid to date' });
        return;
      }
    }

    // For percentage discounts, validate that discount value is <= 100
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue && validatedData.discountValue > 100) {
      res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
      return;
    }

    const updateData: any = { ...validatedData };
    
    if (validatedData.validFrom) {
      updateData.validFrom = new Date(validatedData.validFrom);
    }
    
    if (validatedData.validTo) {
      updateData.validTo = new Date(validatedData.validTo);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
      return;
    }
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

// Delete a coupon
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existingCoupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    await prisma.coupon.delete({
      where: { id }
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

// Toggle coupon status
export const toggleCouponStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existingCoupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    const newStatus = existingCoupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json(coupon);
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({ error: 'Failed to toggle coupon status' });
  }
};

// Get coupon statistics
export const getCouponStats = async (req: Request, res: Response) => {
  try {
    const [total, active, inactive, expired] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { status: 'ACTIVE' } }),
      prisma.coupon.count({ where: { status: 'INACTIVE' } }),
      prisma.coupon.count({ 
        where: { 
          validTo: { lt: new Date() },
          status: 'ACTIVE'
        } 
      })
    ]);

    res.json({
      total,
      active,
      inactive,
      expired
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ error: 'Failed to fetch coupon statistics' });
  }
};

// Get active coupons for public display (no authentication required)
export const getPublicCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        status: 'ACTIVE',
        validTo: {
          gte: new Date() // Only show coupons that haven't expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to 20 most recent active coupons
    });

    res.json({
      coupons,
      total: coupons.length
    });
  } catch (error) {
    console.error('Error fetching public coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};
