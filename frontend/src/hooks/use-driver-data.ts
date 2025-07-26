"use client";

import { useState, useEffect } from 'react';
import { driverApi, vehicleApi } from '@/lib/api';

export interface DriverProfile {
  id: string;
  userId: string;
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
  isOnline: boolean;
  isVerified: boolean;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel: string;
  yearOfManufacture: string;
  insuranceNumber: string;
  isActive: boolean;
  isVerified: boolean;
  registrationDocument?: string;
  insuranceDocument?: string;
  pollutionDocument?: string;
}

export interface Trip {
  id: string;
  bookingId: string;
  status: string;
  startTime?: string;
  endTime?: string;
  distance?: number;
  fare?: number;
  commission?: number;
  driverAmount?: number;
  booking: {
    id: string;
    bookingNumber: string;
    pickupAddress: string;
    dropoffAddress: string;
    estimatedFare: number;
    actualFare?: number;
    customer: {
      fullName: string;
      phoneNumber: string;
    };
  };
}

export interface Earnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  pendingAmount: number;
  totalTrips: number;
  completedTrips: number;
  averageRating: number;
}

export const useDriverData = () => {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [availableBookings, setAvailableBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch driver profile
  const fetchDriverProfile = async () => {
    try {
      const response = await driverApi.getProfile();
      if (response.success && response.data) {
        setDriverProfile(response.data);
        setVehicles(response.data.vehicles || []);
        setError(null); // Clear any previous errors
      }
    } catch (error: any) {
      console.error('Error fetching driver profile:', error);
      // Don't set error for 404 - this is expected for new drivers
      if (error.message && !error.message.includes('404') && !error.message.includes('not found')) {
        setError(error.message || 'Failed to fetch driver profile');
      }
    }
  };

  // Fetch driver trips
  const fetchTrips = async () => {
    try {
      console.log('🚗 Fetching driver trips...');
      const response = await driverApi.getTrips();
      console.log('🚗 Driver trips API response:', response);
      
      if (response.success && response.data) {
        console.log('🚗 Setting trips data:', response.data);
        setTrips(response.data);
      } else {
        console.log('🚗 API response not successful or no data:', response);
      }
    } catch (error: any) {
      console.error('🚗 Error fetching trips:', error);
      setError(error.message || 'Failed to fetch trips');
    }
  };

  // Fetch available bookings
  const fetchAvailableBookings = async () => {
    try {
      const response = await driverApi.getAvailableBookings();
      if (response.success && response.data) {
        setAvailableBookings(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching available bookings:', error);
      setError(error.message || 'Failed to fetch available bookings');
    }
  };

  // Fetch earnings
  const fetchEarnings = async () => {
    try {
      const response = await driverApi.getEarnings();
      if (response.success && response.data) {
        setEarnings(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      setError(error.message || 'Failed to fetch earnings');
    }
  };

  // Update driver profile
  const updateDriverProfile = async (profileData: any) => {
    try {
      const response = await driverApi.updateProfile(profileData);
      if (response.success) {
        await fetchDriverProfile(); // Refresh profile data
        return response;
      }
      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Error updating driver profile:', error);
      throw error;
    }
  };

  // Update online status
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      const response = await driverApi.updateOnlineStatus(isOnline);
      if (response.success) {
        setDriverProfile(prev => prev ? { ...prev, isOnline } : null);
        return response;
      }
      throw new Error(response.message || 'Failed to update online status');
    } catch (error: any) {
      console.error('Error updating online status:', error);
      throw error;
    }
  };

  // Accept booking
  const acceptBooking = async (bookingId: string) => {
    try {
      const response = await driverApi.acceptBooking(bookingId);
      if (response.success) {
        await fetchAvailableBookings(); // Refresh available bookings
        await fetchTrips(); // Refresh trips
        return response;
      }
      throw new Error(response.message || 'Failed to accept booking');
    } catch (error: any) {
      console.error('Error accepting booking:', error);
      throw error;
    }
  };

  // Start trip
  const startTrip = async (bookingId: string) => {
    try {
      const response = await driverApi.startTrip(bookingId);
      if (response.success) {
        await fetchTrips(); // Refresh trips
        return response;
      }
      throw new Error(response.message || 'Failed to start trip');
    } catch (error: any) {
      console.error('Error starting trip:', error);
      throw error;
    }
  };

  // Complete trip
  const completeTrip = async (bookingId: string, tripData: any) => {
    try {
      const response = await driverApi.completeTrip(bookingId, tripData);
      if (response.success) {
        await fetchTrips(); // Refresh trips
        await fetchEarnings(); // Refresh earnings
        return response;
      }
      throw new Error(response.message || 'Failed to complete trip');
    } catch (error: any) {
      console.error('Error completing trip:', error);
      throw error;
    }
  };

  // Update location
  const updateLocation = async (bookingId: string, location: { latitude: number; longitude: number }) => {
    try {
      const response = await driverApi.updateLocation(bookingId, location);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Failed to update location');
    } catch (error: any) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  // Add vehicle
  const addVehicle = async (vehicleData: any) => {
    try {
      console.log('🚗 Adding vehicle via hook:', {
        hasVehicleData: !!vehicleData,
        isFormData: vehicleData instanceof FormData,
        timestamp: new Date().toISOString()
      });
      
      const response = await vehicleApi.createVehicle(vehicleData);
      
      console.log('✅ Vehicle creation response:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data
      });
      
      if (response.success) {
        await fetchDriverProfile(); // Refresh profile to get updated vehicles
        return response;
      }
      throw new Error(response.message || 'Failed to add vehicle');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred while adding vehicle';
      console.error('❌ Error adding vehicle:', {
        message: errorMessage,
        error: error,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorMessage);
    }
  };

  // Update vehicle
  const updateVehicle = async (vehicleId: string, vehicleData: any) => {
    try {
      const response = await vehicleApi.updateVehicle(vehicleId, vehicleData);
      if (response.success) {
        await fetchDriverProfile(); // Refresh profile to get updated vehicles
        return response;
      }
      throw new Error(response.message || 'Failed to update vehicle');
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  // Delete vehicle
  const deleteVehicle = async (vehicleId: string) => {
    try {
      const response = await vehicleApi.deleteVehicle(vehicleId);
      if (response.success) {
        await fetchDriverProfile(); // Refresh profile to get updated vehicles
        return response;
      }
      throw new Error(response.message || 'Failed to delete vehicle');
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to fetch driver profile
      await fetchDriverProfile();
      
      // Then fetch other data
      await Promise.all([
        fetchTrips(),
        fetchAvailableBookings(),
        fetchEarnings(),
      ]);
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      // Don't set error for profile not found - this is expected for new drivers
      if (error.message && !error.message.includes('404') && !error.message.includes('not found')) {
        setError(error.message || 'Failed to refresh data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Data
    driverProfile,
    trips,
    availableBookings,
    earnings,
    vehicles,
    isLoading,
    error,
    
    // Actions
    updateDriverProfile,
    updateOnlineStatus,
    acceptBooking,
    startTrip,
    completeTrip,
    updateLocation,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refreshData,
  };
};
