import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, Phone, RefreshCw } from 'lucide-react';

// Trip type definition
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

interface ActiveTripsTabProps {
  trips: Trip[];
}

export const ActiveTripsTab = ({ trips }: ActiveTripsTabProps): JSX.Element => {
  const { toast } = useToast();
  const [processingTrip, setProcessingTrip] = useState<string | null>(null);

  // Debug: Log the trips data to console
  console.log('ActiveTripsTab received trips:', trips);
  console.log('Total trips count:', trips?.length || 0);

  // Only show active trips (not completed or cancelled)
  const activeTrips = trips.filter(trip => 
    ['STARTED', 'IN_PROGRESS'].includes(trip.status)
  );

  console.log('Active trips filtered:', activeTrips);
  console.log('Active trips count:', activeTrips.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'STARTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'STARTED': return 'Assigned';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status.replace('_', ' ');
    }
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'STARTED':
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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setProcessingTrip(bookingId);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/bookings/${bookingId}/driver-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Trip status updated to ${newStatus.replace('_', ' ')}`,
        });
        
        // Refresh the page to get updated data
        window.location.reload();
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
      setProcessingTrip(null);
    }
  };

  const renderStatusUpdateSelect = (trip: Trip) => {
    const options = getAvailableStatusOptions(trip.status);
    
    if (options.length === 0) {
      return (
        <Badge className={getStatusColor(trip.status)}>
          {getStatusLabel(trip.status)}
        </Badge>
      );
    }

    return (
      <div className="flex items-center gap-3">        <Badge className={getStatusColor(trip.status)}>
          Current: {getStatusLabel(trip.status)}
        </Badge>
        <Select 
          onValueChange={(newStatus) => handleStatusUpdate(trip.booking.id, newStatus)}
          disabled={processingTrip === trip.booking.id}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Update status..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {processingTrip === trip.booking.id && (
          <RefreshCw className="h-4 w-4 animate-spin" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Trips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Your Active Trips</CardTitle>
          <CardDescription className="text-gray-600">
            Manage your assigned trips and update their status as you progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrips.length > 0 ? (
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <Card key={trip.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Trip #{trip.booking.bookingNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Booking ID: {trip.booking.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{trip.booking.estimatedFare}
                        </div>
                        <div className="text-sm text-gray-500">Estimated Fare</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Pickup</span>
                        </div>
                        <div className="text-sm font-medium pl-5">{trip.booking.pickupAddress}</div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Drop-off</span>
                        </div>
                        <div className="text-sm font-medium pl-5">{trip.booking.dropoffAddress}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Customer Details</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{trip.booking.customer.fullName}</div>
                          <div className="text-sm text-gray-500">{trip.booking.customer.phoneNumber}</div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${trip.booking.customer.phoneNumber}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Trip Status</h4>
                      {renderStatusUpdateSelect(trip)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Trips</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You don't have any active trips at the moment. New trips will be assigned to you automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};