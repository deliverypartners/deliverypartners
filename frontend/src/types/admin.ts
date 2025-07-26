// Admin-related TypeScript interfaces

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscount?: number | null;
  validFrom: string; // ISO date string
  validTo: string; // ISO date string
  usageLimitPerUser?: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateCouponRequest {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscount?: number;
  validFrom: string; // ISO date string
  validTo: string; // ISO date string
  usageLimitPerUser?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface CouponsResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}
