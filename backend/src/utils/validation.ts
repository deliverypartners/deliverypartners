import Joi from 'joi';

// User validation schemas
export const createUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+91|91)?[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
      'any.required': 'Phone number is required',
    }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('CUSTOMER', 'DRIVER', 'ADMIN').default('CUSTOMER'),
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+91|91)?[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
    }),
  profileImage: Joi.string().uri().messages({
    'string.uri': 'Profile image must be a valid URL',
  }),
  dateOfBirth: Joi.date().max('now').messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Driver profile validation schemas
export const createDriverProfileSchema = Joi.object({
  aadhaarNumber: Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Aadhaar number must be exactly 12 digits',
      'any.required': 'Aadhaar number is required',
    }),
  licenseNumber: Joi.string().min(5).max(20).required().messages({
    'string.min': 'License number must be at least 5 characters',
    'string.max': 'License number cannot exceed 20 characters',
    'any.required': 'License number is required',
  }),
  experienceYears: Joi.number().min(0).max(50).required().messages({
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience cannot exceed 50 years',
    'any.required': 'Experience years is required',
  }),
  address: Joi.string().min(10).max(500).messages({
    'string.min': 'Address must be at least 10 characters',
    'string.max': 'Address cannot exceed 500 characters',
  }),
  city: Joi.string().min(2).max(100).messages({
    'string.min': 'City must be at least 2 characters',
    'string.max': 'City cannot exceed 100 characters',
  }),
  state: Joi.string().min(2).max(100).messages({
    'string.min': 'State must be at least 2 characters',
    'string.max': 'State cannot exceed 100 characters',
  }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .messages({
      'string.pattern.base': 'Pincode must be exactly 6 digits',
    }),
  emergencyContactName: Joi.string().min(2).max(100).messages({
    'string.min': 'Emergency contact name must be at least 2 characters',
    'string.max': 'Emergency contact name cannot exceed 100 characters',
  }),
  emergencyContactNumber: Joi.string()
    .pattern(/^(\+91|91)?[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
    }),
  languagesSpoken: Joi.string().max(200).messages({
    'string.max': 'Languages spoken cannot exceed 200 characters',
  }),
});

export const updateDriverProfileSchema = Joi.object({
  aadhaarNumber: Joi.string()
    .pattern(/^\d{12}$/)
    .messages({
      'string.pattern.base': 'Aadhaar number must be exactly 12 digits',
    }),
  licenseNumber: Joi.string().min(5).max(20).messages({
    'string.min': 'License number must be at least 5 characters',
    'string.max': 'License number cannot exceed 20 characters',
  }),
  experienceYears: Joi.number().min(0).max(50).messages({
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience cannot exceed 50 years',
  }),
  address: Joi.string().min(10).max(500).messages({
    'string.min': 'Address must be at least 10 characters',
    'string.max': 'Address cannot exceed 500 characters',
  }),
  city: Joi.string().min(2).max(100).messages({
    'string.min': 'City must be at least 2 characters',
    'string.max': 'City cannot exceed 100 characters',
  }),
  state: Joi.string().min(2).max(100).messages({
    'string.min': 'State must be at least 2 characters',
    'string.max': 'State cannot exceed 100 characters',
  }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .messages({
      'string.pattern.base': 'Pincode must be exactly 6 digits',
    }),
  emergencyContactName: Joi.string().min(2).max(100).messages({
    'string.min': 'Emergency contact name must be at least 2 characters',
    'string.max': 'Emergency contact name cannot exceed 100 characters',
  }),
  emergencyContactNumber: Joi.string()
    .pattern(/^(\+91|91)?[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
    }),
  languagesSpoken: Joi.string().max(200).messages({
    'string.max': 'Languages spoken cannot exceed 200 characters',
  }),
});

// Vehicle validation schemas
export const createVehicleSchema = Joi.object({
  vehicleType: Joi.string()
    .valid('BIKE', 'AUTO', 'CAR', 'TRUCK', 'VAN', 'TEMPO')
    .required()
    .messages({
      'any.only': 'Vehicle type must be one of: BIKE, AUTO, CAR, TRUCK, VAN, TEMPO',
      'any.required': 'Vehicle type is required',
    }),
  vehicleNumber: Joi.string()
    .pattern(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Indian vehicle number (e.g., KA01AB1234)',
      'any.required': 'Vehicle number is required',
    }),
  vehicleModel: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Vehicle model must be at least 2 characters',
    'string.max': 'Vehicle model cannot exceed 100 characters',
    'any.required': 'Vehicle model is required',
  }),
  yearOfManufacture: Joi.string()
    .pattern(/^\d{4}$/)
    .custom((value, helpers) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1990 || year > currentYear) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'string.pattern.base': 'Year of manufacture must be a 4-digit year',
      'any.invalid': 'Year of manufacture must be between 1990 and current year',
      'any.required': 'Year of manufacture is required',
    }),
  insuranceNumber: Joi.string().min(5).max(50).required().messages({
    'string.min': 'Insurance number must be at least 5 characters',
    'string.max': 'Insurance number cannot exceed 50 characters',
    'any.required': 'Insurance number is required',
  }),
});

export const updateVehicleSchema = Joi.object({
  vehicleType: Joi.string()
    .valid('BIKE', 'AUTO', 'CAR', 'TRUCK', 'VAN', 'TEMPO')
    .messages({
      'any.only': 'Vehicle type must be one of: BIKE, AUTO, CAR, TRUCK, VAN, TEMPO',
    }),
  vehicleNumber: Joi.string()
    .pattern(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Indian vehicle number (e.g., KA01AB1234)',
    }),
  vehicleModel: Joi.string().min(2).max(100).messages({
    'string.min': 'Vehicle model must be at least 2 characters',
    'string.max': 'Vehicle model cannot exceed 100 characters',
  }),
  yearOfManufacture: Joi.string()
    .pattern(/^\d{4}$/)
    .custom((value, helpers) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1990 || year > currentYear) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Year of manufacture must be a 4-digit year',
      'any.invalid': 'Year of manufacture must be between 1990 and current year',
    }),
  insuranceNumber: Joi.string().min(5).max(50).messages({
    'string.min': 'Insurance number must be at least 5 characters',
    'string.max': 'Insurance number cannot exceed 50 characters',
  }),
  isActive: Joi.boolean(),
});

// Booking validation schemas
export const createBookingSchema = Joi.object({
  serviceType: Joi.string()
    .valid('BIKE_DELIVERY', 'AUTO_RIDE', 'CAR_RIDE', 'TRUCK_DELIVERY', 'PACKERS_MOVERS')
    .required()
    .messages({
      'any.only': 'Service type must be one of the supported services',
      'any.required': 'Service type is required',
    }),
  pickupAddress: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Pickup address must be at least 10 characters',
    'string.max': 'Pickup address cannot exceed 500 characters',
    'any.required': 'Pickup address is required',
  }),
  pickupLatitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Pickup latitude must be between -90 and 90',
    'number.max': 'Pickup latitude must be between -90 and 90',
    'any.required': 'Pickup latitude is required',
  }),
  pickupLongitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Pickup longitude must be between -180 and 180',
    'number.max': 'Pickup longitude must be between -180 and 180',
    'any.required': 'Pickup longitude is required',
  }),
  pickupDateTime: Joi.date().min('now').required().messages({
    'date.min': 'Pickup date and time cannot be in the past',
    'any.required': 'Pickup date and time is required',
  }),
  dropoffAddress: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Dropoff address must be at least 10 characters',
    'string.max': 'Dropoff address cannot exceed 500 characters',
    'any.required': 'Dropoff address is required',
  }),
  dropoffLatitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Dropoff latitude must be between -90 and 90',
    'number.max': 'Dropoff latitude must be between -90 and 90',
    'any.required': 'Dropoff latitude is required',
  }),
  dropoffLongitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Dropoff longitude must be between -180 and 180',
    'number.max': 'Dropoff longitude must be between -180 and 180',
    'any.required': 'Dropoff longitude is required',
  }),
  estimatedFare: Joi.number().min(0).required().messages({
    'number.min': 'Estimated fare cannot be negative',
    'any.required': 'Estimated fare is required',
  }),
  notes: Joi.string().max(500).allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters',
  }),
  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING')
    .default('CASH')
    .messages({
      'any.only': 'Payment method must be one of: CASH, CARD, UPI, WALLET, NET_BANKING',
    }),
});

// Auth validation schemas
export const registerSchema = createUserSchema;

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required',
  }),
});

// Common validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    'number.min': 'Page number must be at least 1',
  }),
  limit: Joi.number().min(1).max(100).default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be either "asc" or "desc"',
  }),
});

export const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'ID parameter is required',
  }),
});
