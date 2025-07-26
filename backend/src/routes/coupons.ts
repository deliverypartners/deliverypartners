import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats
} from '../controllers/couponController';

const router = express.Router();
const prisma = new PrismaClient() as any; // Use same workaround as controller

// Public route for getting active coupons (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const activeCoupons = await prisma.coupon.findMany({
      where: { 
        status: 'ACTIVE',
        validTo: { gte: new Date() } // Only show non-expired coupons
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      coupons: activeCoupons
    });
  } catch (error) {
    console.error('Error fetching public coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// All other coupon routes require admin authentication
router.use(authenticate, authorize('ADMIN'));

// GET /api/coupons/stats - Get coupon statistics
router.get('/stats', getCouponStats);

// GET /api/coupons - Get all coupons with pagination and filtering
router.get('/', getCoupons);

// GET /api/coupons/:id - Get a specific coupon
router.get('/:id', getCouponById);

// POST /api/coupons - Create a new coupon
router.post('/', createCoupon);

// PUT /api/coupons/:id - Update a coupon
router.put('/:id', updateCoupon);

// PATCH /api/coupons/:id/toggle-status - Toggle coupon status
router.patch('/:id/toggle-status', toggleCouponStatus);

// DELETE /api/coupons/:id - Delete a coupon
router.delete('/:id', deleteCoupon);

export default router;
