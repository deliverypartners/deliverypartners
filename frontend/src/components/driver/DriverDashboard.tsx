'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Clock, CheckCircle, RefreshCw, Car, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string;
  estimatedFare: number;
  customer: {
    fullName: string;
    phoneNumber: string;
  };
  createdAt: string;
}

export default function DriverDashboard() {
  const [activeTrips, setActiveTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      // Fetch all trips assigned to this driver
      const response = await fetch('/api/bookings/driver/my-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const trips = result.data || [];
        // Show all trips that are assigned to the driver and not completed/cancelled
        setActiveTrips(trips.filter((trip: Booking) => 
          ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(trip.status)
        ));
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('An error occurred while fetching trips');
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (bookingId: string, newStatus: string) => {
    try {
      setProcessingBooking(bookingId);
      
      let endpoint = '';
      switch (newStatus) {
        case 'DRIVER_ARRIVED':
          endpoint = `/api/bookings/${bookingId}/arrived`;
          break;
        case 'IN_PROGRESS':
          endpoint = `/api/bookings/${bookingId}/start`;
          break;
        case 'COMPLETED':
          endpoint = `/api/bookings/${bookingId}/complete`;
          break;
        default:
          endpoint = `/api/bookings/admin/status`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: endpoint === '/api/bookings/admin/status' ? JSON.stringify({ bookingId, status: newStatus }) : undefined
      });

      if (response.ok) {
        const statusMessages = {
          'DRIVER_ARRIVED': 'Marked as arrived at pickup location',
          'IN_PROGRESS': 'Trip started successfully',
          'COMPLETED': 'Trip completed successfully'
        };

        toast({
          title: "Success",
          description: statusMessages[newStatus as keyof typeof statusMessages] || 'Status updated successfully',
        });
        fetchActiveTrips(); // Refresh trips
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update trip status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating trip status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating trip status",
        variant: "destructive"
      });
    } finally {
      setProcessingBooking(null);
    }
  };

  useEffect(() => {
    fetchActiveTrips();
    
    // Set up polling to refresh trips every 30 seconds
    const interval = setInterval(fetchActiveTrips, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRIVER_ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'DRIVER_ARRIVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'DRIVER_ASSIGNED':
        return [
          { value: 'DRIVER_ARRIVED', label: 'Arrived at Pickup' }
        ];
      case 'DRIVER_ARRIVED':
        return [
          { value: 'IN_PROGRESS', label: 'Start Trip' }
        ];
      case 'IN_PROGRESS':
        return [
          { value: 'COMPLETED', label: 'Complete Trip' }
        ];
      default:
        return [];
    }
  };

  const renderStatusUpdateSelect = (booking: Booking) => {
    const isProcessing = processingBooking === booking.id;
    const statusOptions = getAvailableStatusOptions(booking.status);
    
    if (statusOptions.length === 0) {
      return (
        <div className="text-center py-2">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.replace('_', ' ')}
          </Badge>
        </div>
      );
    }

    return (
      <Select
        disabled={isProcessing}
        onValueChange={(value) => updateTripStatus(booking.id, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Update Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderTripCard = (booking: Booking) => (
    <Card key={booking.id} className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Booking #{booking.bookingNumber}
            </CardTitle>
            <CardDescription>
              Created: {new Date(booking.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Pickup</span>
            </div>
            <p className="text-sm text-gray-600 ml-5">{booking.pickupAddress}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Drop-off</span>
            </div>
            <p className="text-sm text-gray-600 ml-5">{booking.dropoffAddress}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Customer Details</h4>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{booking.customer.fullName}</p>
              <p className="text-sm text-gray-600">{booking.customer.phoneNumber}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${booking.customer.phoneNumber}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </a>
            </Button>
          </div>
        </div>

        {/* Trip Details */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Estimated Fare</p>
            <p className="text-lg font-semibold">₹{booking.estimatedFare}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pickup Time</p>
            <p className="text-sm font-medium">
              {new Date(booking.pickupDateTime).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Update */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Update Trip Status</h4>
          {renderStatusUpdateSelect(booking)}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchActiveTrips}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Active Trips</h1>
          <Button variant="outline" onClick={fetchActiveTrips}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-blue-900 mb-1">Active Trips ({activeTrips.length})</h2>
          <p className="text-sm text-blue-700">
            Trips assigned to you. Update the status as you progress through each trip.
          </p>
        </div>

        {activeTrips.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No active trips</p>
              <p className="text-sm text-gray-400 mt-2">
                Assigned trips will appear here automatically
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeTrips.map(renderTripCard)}
          </div>
        )}
      </div>
    </div>
  );
}
