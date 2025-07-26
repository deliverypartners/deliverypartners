// Admin API Layer for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies for session-based auth
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(`Admin API call to ${endpoint}: Response status:`, response.status);
    console.log(`Admin API call to ${endpoint}: Content-Type:`, response.headers.get('content-type'));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error(`Admin API call to ${endpoint}: Non-JSON response received:`, textResponse);
      throw new Error('Server returned an invalid response. Please check if the backend is running.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    
    // Return the response data directly since backend sends structured response
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    // Return a structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      data: null
    };
  }
}

// Admin Dashboard API
export const adminDashboardApi = {
  // Get dashboard stats
  getStats: async () => {
    return apiCall('/admin/dashboard');
  },
  
  // Get analytics
  getAnalytics: async () => {
    return apiCall('/admin/analytics');
  },

  // Get system health
  getSystemHealth: async () => {
    return apiCall('/admin/system/health');
  }
};

// Users Management API
export const adminUsersApi = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10, role?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
      ...(search && { search })
    });
    return apiCall(`/users?${params}`);
  },
  
  // Get user by ID
  getUser: async (id: string) => {
    return apiCall(`/users/${id}`);
  },
  
  // Create new user
  createUser: async (userData: any) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // Update user
  updateUser: async (id: string, userData: any) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  // Delete user
  deleteUser: async (id: string) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Block/Unblock user
  toggleUserStatus: async (id: string, isActive: boolean) => {
    return apiCall(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
  },
  
  // Get user's customer profile
  getUserProfile: async (id: string) => {
    return apiCall(`/users/${id}/customer-profile`);
  }
};

// Bookings Management API
export const adminBookingsApi = {
  // Get all bookings
  getBookings: async (page = 1, limit = 10, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });
    return apiCall(`/bookings/admin/all?${params}`);
  },
  
  // Get booking by ID
  getBooking: async (id: string) => {
    return apiCall(`/bookings/${id}`);
  },
  
  // Create new booking (admin only)
  createBooking: async (bookingData: any) => {
    return apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },
  
  // Update booking
  updateBooking: async (id: string, bookingData: any) => {
    return apiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
  },
  
  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string) => {
    return apiCall(`/bookings/admin/status`, {
      method: 'PUT',
      body: JSON.stringify({ bookingId, status })
    });
  },
  
  // Assign driver to booking
  assignDriver: async (bookingId: string, driverId: string) => {
    return apiCall(`/bookings/admin/assign-driver`, {
      method: 'POST',
      body: JSON.stringify({ bookingId, driverId })
    });
  },
  
  // Cancel booking
  cancelBooking: async (id: string, reason: string) => {
    return apiCall(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },
  
  // Get booking analytics
  getBookingAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiCall(`/admin/reports/bookings?${params}`);
  },
  
  // Start trip
  startTrip: async (id: string) => apiCall(`/bookings/${id}/start`, { method: 'PUT' }),
  
  // Complete trip
  completeTrip: async (id: string, data: any) => apiCall(`/bookings/${id}/complete`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Update location
  updateLocation: async (id: string, latitude: number, longitude: number) => apiCall(`/bookings/${id}/update-location`, { method: 'PUT', body: JSON.stringify({ latitude, longitude }) }),
};

// Drivers Management API
export const adminDriversApi = {
  // Get all drivers
  getDrivers: async (page = 1, limit = 10, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });
    return apiCall(`/drivers?${params}`);
  },
  
  // Get driver by ID
  getDriver: async (id: string) => {
    return apiCall(`/drivers/${id}`);
  },
  
  // Create new driver
  createDriver: async (driverData: any) => {
    return apiCall('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },
  
  // Update driver
  updateDriver: async (id: string, driverData: any) => {
    return apiCall(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },
  
  // Update driver status (active/inactive)
  updateDriverStatus: async (id: string, isActive: boolean) => {
    return apiCall(`/drivers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
  },
  
  // Update driver online status
  updateDriverOnlineStatus: async (id: string, isOnline: boolean) => {
    return apiCall(`/drivers/${id}/online-status`, {
      method: 'PUT',
      body: JSON.stringify({ isOnline })
    });
  },
  
  // Approve/Reject driver
  updateDriverApproval: async (id: string, isApproved: boolean, reason?: string) => {
    return apiCall(`/drivers/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved, reason })
    });
  },
  
  // Delete driver
  deleteDriver: async (id: string) => {
    return apiCall(`/drivers/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Get driver's vehicles
  getDriverVehicles: async (id: string) => {
    return apiCall(`/drivers/${id}/vehicles`);
  },
  
  // Get driver's bookings
  getDriverBookings: async (id: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiCall(`/drivers/${id}/bookings?${params}`);
  }
};

// Vehicles Management API
export const adminVehiclesApi = {
  // Get all vehicles
  getVehicles: async () => apiCall('/vehicles'),
  
  // Get vehicle by ID
  getVehicle: async (id: string) => {
    return apiCall(`/vehicles/${id}`);
  },
  
  // Create new vehicle
  createVehicle: async (data: any) => apiCall('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  
  // Update vehicle
  updateVehicle: async (id: string, data: any) => apiCall(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Update vehicle status
  updateVehicleStatus: async (id: string, isActive: boolean) => apiCall(`/vehicles/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
  
  // Approve/Reject vehicle
  updateVehicleApproval: async (id: string, isApproved: boolean, reason?: string) => {
    return apiCall(`/vehicles/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved, reason })
    });
  },
  
  // Delete vehicle
  deleteVehicle: async (id: string) => apiCall(`/vehicles/${id}`, { method: 'DELETE' }),
  
  // Verify vehicle
  verifyVehicle: async (id: string) => apiCall(`/vehicles/${id}/verify`, { method: 'PUT' }),
};

// Coupons Management API
export const adminCouponsApi = {
  // Get all coupons
  getCoupons: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiCall(`/coupons?${params}`);
  },
  
  // Get coupon by ID
  getCoupon: async (id: string) => {
    return apiCall(`/coupons/${id}`);
  },
  
  // Create new coupon
  createCoupon: async (couponData: any) => {
    return apiCall('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  },
  
  // Update coupon
  updateCoupon: async (id: string, couponData: any) => {
    return apiCall(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    });
  },
  
  // Delete coupon
  deleteCoupon: async (id: string) => {
    return apiCall(`/coupons/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Toggle coupon status (active/inactive)
  toggleCouponStatus: async (id: string) => {
    return apiCall(`/coupons/${id}/toggle-status`, {
      method: 'PATCH'
    });
  },
  
  // Get coupon statistics
  getCouponStats: async () => {
    return apiCall('/coupons/stats');
  }
};

// Transactions Management API
export const adminTransactionsApi = {
  // Get all transactions
  getTransactions: async (page = 1, limit = 10, status?: string, type?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(type && { type })
    });
    return apiCall(`/transactions?${params}`);
  },
  
  // Get transaction by ID
  getTransaction: async (id: string) => {
    return apiCall(`/transactions/${id}`);
  },
  
  // Process refund
  processRefund: async (transactionId: string, amount: number, reason: string) => {
    return apiCall(`/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason })
    });
  }
};

// Notifications Management API
export const adminNotificationsApi = {
  // Get all notifications
  getNotifications: async (page = 1, limit = 10, type?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type })
    });
    return apiCall(`/notifications?${params}`);
  },
  
  // Send notification to users
  sendNotification: async (notificationData: any) => {
    return apiCall('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  },
  
  // Send bulk notification
  sendBulkNotification: async (notificationData: any) => {
    return apiCall('/notifications/send-bulk', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }
};

// Reports and Analytics API
export const adminReportsApi = {
  // Get booking report
  getBookingReport: async () => apiCall('/admin/reports/bookings'),
  
  // Get earnings report
  getEarningsReport: async () => apiCall('/admin/reports/earnings'),
  
  // Get driver report
  getDriverReport: async () => apiCall('/admin/reports/drivers'),
  
  // Export report
  exportReport: async (reportType: string, format: 'csv' | 'pdf', filters: any) => {
    return apiCall(`/admin/reports/export`, {
      method: 'POST',
      body: JSON.stringify({ reportType, format, filters })
    });
  },
  
  // Get analytics
  getAnalytics: async () => apiCall('/admin/analytics'),
  
  // Create backup
  createBackup: async () => apiCall('/admin/system/backup', { method: 'POST' }),
};

// Settings Management API
export const adminSettingsApi = {
  // Get all settings
  getSettings: async () => {
    return apiCall('/admin/settings');
  },
  
  // Update settings
  updateSettings: async (settings: any) => {
    return apiCall('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },
  
  // Get pricing settings
  getPricingSettings: async () => {
    return apiCall('/admin/settings/pricing');
  },
  
  // Update pricing settings
  updatePricingSettings: async (pricingData: any) => {
    return apiCall('/admin/settings/pricing', {
      method: 'PUT',
      body: JSON.stringify(pricingData)
    });
  }
};

// Analytics API (Legacy - keeping for backward compatibility)
export const adminAnalyticsApi = {
  // Get booking analytics
  getBookingAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiCall(`/admin/analytics/bookings?${params}`);
  },
  
  // Get revenue analytics
  getRevenueAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiCall(`/admin/analytics/revenue?${params}`);
  }
};

export default {
  dashboard: adminDashboardApi,
  users: adminUsersApi,
  bookings: adminBookingsApi,
  drivers: adminDriversApi,
  vehicles: adminVehiclesApi,
  coupons: adminCouponsApi,
  transactions: adminTransactionsApi,
  notifications: adminNotificationsApi,
  reports: adminReportsApi,
  settings: adminSettingsApi,
  analytics: adminAnalyticsApi
};
