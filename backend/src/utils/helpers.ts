import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

export const createResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (error !== undefined) {
    response.error = error;
  }
  
  return response;
};

export const createSuccessResponse = <T = any>(
  message: string = 'Success',
  data?: T
): ApiResponse<T> => {
  return createResponse(true, message, data);
};

export const createErrorResponse = (
  message: string = 'Error occurred',
  error?: string
): ApiResponse => {
  return createResponse(false, message, undefined, error);
};

export const createPaginatedResponse = <T = any>(
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message: string = 'Success'
): PaginatedResponse<T> => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
};

export const calculatePagination = (params: PaginationParams, total: number) => {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};

export const parsePaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const generateBookingNumber = (): string => {
  const prefix = 'BK';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp.slice(-6)}${random}`;
};

export const generateTicketNumber = (): string => {
  const prefix = 'TK';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp.slice(-6)}${random}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return phone;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

export const calculateEstimatedFare = (
  distance: number,
  serviceType: string,
  vehicleType: string
): number => {
  const baseFares: Record<string, number> = {
    BIKE: 25,
    AUTO: 30,
    CAR: 40,
    TRUCK: 100,
    VAN: 80,
    TEMPO: 90,
  };

  const perKmRates: Record<string, number> = {
    BIKE: 8,
    AUTO: 12,
    CAR: 15,
    TRUCK: 25,
    VAN: 20,
    TEMPO: 22,
  };

  const baseFare = baseFares[vehicleType] || 30;
  const perKmRate = perKmRates[vehicleType] || 12;
  
  const fare = baseFare + (distance * perKmRate);
  return Math.round(fare);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
