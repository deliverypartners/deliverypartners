// API configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;

// Fix the console.log to check the correct variable name
console.log('🔧 Current API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 Fallback API_BASE_URL:', process.env.NEXT_ELSE_PUBLIC_API_URL);
console.log('🔧 Final API_BASE_URL used:', API_BASE_URL);
console.log('🔧 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  all_env_vars: Object.keys(process.env).filter(key => key.includes('API'))
});

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  preferredPaymentMethod?: string;
  defaultAddress?: string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  // Debug token information with more details
  console.log('🔐 API Call Token Debug:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPrefix: token?.substring(0, 20) + '...',
    tokenSuffix: token ? '...' + token.substring(token.length - 20) : 'No token',
    endpoint,
    method: options.method || 'GET',
    timestamp: new Date().toISOString()
  });
  
  // Check if the body is FormData
  const isFormData = options.body instanceof FormData;
  
  // Build headers properly
  const headers: Record<string, string> = {};
  
  // Add Content-Type only for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Always add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge with provided headers, but preserve our Authorization header
  const finalHeaders: Record<string, string> = {
    ...headers,
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Ensure Authorization header is always present if we have a token
  if (token && !finalHeaders['Authorization']) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    mode: 'cors',
    headers: finalHeaders,
    ...options,
  };

  console.log('API Call Details:', {
    url: `${API_BASE_URL}${endpoint}`,
    hasToken: !!token,
    tokenLength: token?.length,
    method: config.method || 'GET',
    hasBody: !!config.body,
    isFormData,
    headers: Object.keys(finalHeaders),
    authHeaderPresent: !!finalHeaders['Authorization'],
    authHeaderValue: finalHeaders['Authorization'] ? finalHeaders['Authorization'].substring(0, 20) + '...' : 'No auth header'
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response content-type:', response.headers.get('content-type'));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned an invalid response: ${textResponse || 'Please check if the backend is running.'}`);
    }
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorDetails = null;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        errorDetails = errorData.error || errorData.data || null;
        
        // Enhanced error logging
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}${endpoint}`,
          method: config.method || 'GET',
          errorData,
          hasToken: !!token,
          tokenPresent: token ? 'Yes' : 'No'
        });
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401 && token) {
          console.warn('🔒 Token appears to be invalid or expired, clearing local storage');
          localStorage.removeItem('authToken');
          // Optionally redirect to login page or emit an event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('token-expired'));
          }
        }
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed to parse error response:', e);
        console.error('Raw response status:', response.status);
        console.error('Raw response statusText:', response.statusText);
      }
      
      // If it's a validation error, try to parse and show more specific details
      if (errorDetails && typeof errorDetails === 'string') {
        try {
          const validationErrors = JSON.parse(errorDetails);
          if (Array.isArray(validationErrors)) {
            const validationMessages = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMessage = `Validation failed: ${validationMessages}`;
          }
        } catch (e) {
          // If parsing fails, use the original error message
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    // Enhanced error logging to avoid empty object logs
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined,
      url: `${API_BASE_URL}${endpoint}`,
      method: config.method || 'GET',
      hasToken: !!token,
      timestamp: new Date().toISOString()
    };
    
    console.error('🚨 API call failed:', errorDetails);
    console.error('API_BASE_URL:', API_BASE_URL);
    console.error('Full URL:', `${API_BASE_URL}${endpoint}`);
    
    // Provide more specific error messages for common issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Unable to connect to the server at ${API_BASE_URL}. Please ensure the backend server is running on port 4000.`);
    }
    
    throw error;
  }
}

// Authentication API calls
export const authApi = {
  register: async (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiCall('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('authToken');
    return response;
  },
};

// User API calls
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiCall('/users/profile');
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  createCustomerProfile: async (profileData: {
    preferredPaymentMethod?: string;
    defaultAddress?: string;
    loyaltyPoints?: number;
  }): Promise<ApiResponse<CustomerProfile>> => {
    return apiCall('/users/customer-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  getCustomerProfile: async (): Promise<ApiResponse<CustomerProfile>> => {
    return apiCall('/users/customer-profile');
  },
};

// Driver API calls
export const driverApi = {
  // Get driver profile
  getProfile: async (): Promise<ApiResponse<any>> => {
    return apiCall('/drivers/profile');
  },

  // Update driver profile
  updateProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    return apiCall('/drivers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Update online status
  updateOnlineStatus: async (isOnline: boolean): Promise<ApiResponse<any>> => {
    return apiCall('/drivers/status', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  },

  // Get driver earnings
  getEarnings: async (): Promise<ApiResponse<any>> => {
    return apiCall('/drivers/earnings');
  },

  // Get driver trips
  getTrips: async (): Promise<ApiResponse<any>> => {
    return apiCall('/drivers/trips');
  },

  // Get available bookings for driver
  getAvailableBookings: async (): Promise<ApiResponse<any>> => {
    return apiCall('/bookings/driver/available');
  },

  // Accept booking
  acceptBooking: async (bookingId: string): Promise<ApiResponse<any>> => {
    return apiCall(`/bookings/${bookingId}/accept`, {
      method: 'PUT',
    });
  },

  // Start trip
  startTrip: async (bookingId: string): Promise<ApiResponse<any>> => {
    return apiCall(`/bookings/${bookingId}/start`, {
      method: 'PUT',
    });
  },

  // Complete trip
  completeTrip: async (bookingId: string, tripData: any): Promise<ApiResponse<any>> => {
    return apiCall(`/bookings/${bookingId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },

  // Update location
  updateLocation: async (bookingId: string, location: { latitude: number; longitude: number }): Promise<ApiResponse<any>> => {
    return apiCall(`/bookings/${bookingId}/update-location`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  },
};

// Vehicle API calls
export const vehicleApi = {
  // Get driver's vehicles
  getVehicles: async (): Promise<ApiResponse<any>> => {
    return apiCall('/vehicles/my-vehicles');
  },

  // Create vehicle
  createVehicle: async (vehicleData: FormData | any): Promise<ApiResponse<any>> => {
    const isFormData = vehicleData instanceof FormData;
    
    console.log('🚗 Creating vehicle with data type:', isFormData ? 'FormData' : 'JSON');
    
    const requestOptions: RequestInit = {
      method: 'POST',
      body: isFormData ? vehicleData : JSON.stringify(vehicleData),
    };
    
    // Important: Let apiCall handle headers including Authorization
    // Only add Content-Type for non-FormData requests (apiCall will handle this)
    if (!isFormData) {
      requestOptions.headers = { 'Content-Type': 'application/json' };
    }
    
    return apiCall('/vehicles', requestOptions);
  },

  // Update vehicle
  updateVehicle: async (vehicleId: string, vehicleData: any): Promise<ApiResponse<any>> => {
    return apiCall(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId: string): Promise<ApiResponse<any>> => {
    return apiCall(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  },
};

// Token management with custom event dispatching
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('authStateChange', { 
      detail: { authenticated: true, token } 
    }));
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('authStateChange', { 
      detail: { authenticated: false, token: null } 
    }));
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  getUserData: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Decode JWT token to get user data
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};
