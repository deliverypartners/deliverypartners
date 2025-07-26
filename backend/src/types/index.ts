export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// User related types
export interface CreateUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  dateOfBirth?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
  };
  token: string;
  expiresIn: string;
}

// Driver profile types
export interface CreateDriverProfileRequest {
  aadhaarNumber: string;
  licenseNumber: string;
  experienceYears: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  languagesSpoken?: string;
}

export interface UpdateDriverProfileRequest {
  aadhaarNumber?: string;
  licenseNumber?: string;
  experienceYears?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  languagesSpoken?: string;
}

// Vehicle related types
export interface CreateVehicleRequest {
  vehicleType: 'BIKE' | 'AUTO' | 'CAR' | 'TRUCK' | 'VAN' | 'TEMPO';
  vehicleNumber: string;
  vehicleModel: string;
  yearOfManufacture: string;
  insuranceNumber: string;
}

export interface UpdateVehicleRequest {
  vehicleType?: 'BIKE' | 'AUTO' | 'CAR' | 'TRUCK' | 'VAN' | 'TEMPO';
  vehicleNumber?: string;
  vehicleModel?: string;
  yearOfManufacture?: string;
  insuranceNumber?: string;
  isActive?: boolean;
}

// Booking related types
export interface CreateBookingRequest {
  serviceType: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupDateTime: Date;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  estimatedFare: number;
  notes?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING';
}

export interface UpdateBookingRequest {
  status?: string;
  driverId?: string;
  vehicleId?: string;
  actualFare?: number;
  paymentStatus?: string;
  notes?: string;
}

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';
export type VehicleType = 'BIKE' | 'AUTO' | 'CAR' | 'TRUCK' | 'VAN' | 'TEMPO';
export type ServiceType = 'BIKE_DELIVERY' | 'AUTO_RIDE' | 'CAR_RIDE' | 'TRUCK_DELIVERY' | 'PACKERS_MOVERS';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'DRIVER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
