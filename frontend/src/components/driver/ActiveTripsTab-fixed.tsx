import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MapPin, Clock, DollarSign, Navigation, Package } from 'lucide-react';

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

export interface AvailableBooking {
  id: string;
  bookingNumber: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedFare: number;
  distance?: number;
  customer: {
    fullName: string;
    phoneNumber: string;
  };
  createdAt: string;
}

interface ActiveTripsTabProps {
  trips: Trip[];
  availableBookings: AvailableBooking[];
  onAcceptBooking: (bookingId: string) => Promise<void>;
  onStartTrip: (bookingId: string) => Promise<void>;
}

export const ActiveTripsTab = ({ 
  trips, 
  availableBookings, 
  onAcceptBooking, 
  onStartTrip 
}: ActiveTripsTabProps): JSX.Element => {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<AvailableBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("distance");

  const activeTrips = trips.filter(trip => trip.status !== 'COMPLETED');

  // Handle trip acceptance
  const handleTripAcceptance = async (booking: AvailableBooking) => {
    try {
      await onAcceptBooking(booking.id);
      toast({
        title: "Trip Accepted! 🎉",
        description: `You have successfully accepted booking ${booking.bookingNumber}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept trip",
        variant: "destructive",
      });
    }
  };

  // Handle trip rejection
  const handleTripRejection = (booking: AvailableBooking) => {
    toast({
      title: "Trip Rejected",
      description: `Booking ${booking.bookingNumber} has been rejected - ${rejectionReason}`,
      variant: "destructive",
    });
  };

  // Handle trip start
  const handleTripStart = async (trip: Trip) => {
    try {
      await onStartTrip(trip.bookingId);
      toast({
        title: "Trip Started! 🚗",
        description: `Trip ${trip.booking.bookingNumber} has been started`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start trip",
        variant: "destructive",
      });
    }
  };

  // Available Booking Card Component
  const AvailableBookingCard = ({ booking }: { booking: AvailableBooking }) => (
    <Card className="mb-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {booking.bookingNumber}
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              Available
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">₹{booking.estimatedFare}</div>
            <div className="text-xs text-gray-500">
              {booking.distance ? `${booking.distance} km` : 'Distance TBD'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span>Pickup</span>
            </div>
            <div className="text-sm font-medium pl-6">{booking.pickupAddress}</div>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Navigation className="h-4 w-4" />
              <span>Dropoff</span>
            </div>
            <div className="text-sm font-medium pl-6">{booking.dropoffAddress}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="text-sm font-medium">{booking.customer.fullName}</div>
            <div className="text-xs text-gray-500">{booking.customer.phoneNumber}</div>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700" 
            onClick={() => handleTripAcceptance(booking)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Accept
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Trip</DialogTitle>
                <DialogDescription>
                  Please select a reason for rejecting this trip request.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Booking Details</label>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>ID: {booking.bookingNumber}</div>
                    <div>{booking.pickupAddress} → {booking.dropoffAddress}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Select value={rejectionReason} onValueChange={setRejectionReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Too far from my location</SelectItem>
                      <SelectItem value="traffic">Heavy traffic expected</SelectItem>
                      <SelectItem value="unavailable">Currently unavailable</SelectItem>
                      <SelectItem value="other">Other reason</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => handleTripRejection(booking)}
                >
                  Confirm Rejection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Available Bookings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Available Trips</CardTitle>
          <CardDescription className="text-gray-600">
            New trip requests available for acceptance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableBookings.length > 0 ? (
            <div className="space-y-4">
              {availableBookings.map((booking) => (
                <AvailableBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Trips</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                There are no trip requests available at the moment. New requests will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Your Active Trips</CardTitle>
          <CardDescription className="text-gray-600">
            Trips you have accepted and are currently handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrips.length > 0 ? (
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <Card key={trip.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {trip.booking.bookingNumber}
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">₹{trip.booking.estimatedFare}</div>
                        <div className="text-xs text-gray-500">
                          {trip.distance ? `${trip.distance} km` : 'Distance TBD'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span>Pickup</span>
                        </div>
                        <div className="text-sm font-medium pl-6">{trip.booking.pickupAddress}</div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Navigation className="h-4 w-4" />
                          <span>Dropoff</span>
                        </div>
                        <div className="text-sm font-medium pl-6">{trip.booking.dropoffAddress}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-1">Customer</div>
                        <div className="text-sm font-medium">{trip.booking.customer.fullName}</div>
                        <div className="text-xs text-gray-500">{trip.booking.customer.phoneNumber}</div>
                      </div>
                    </div>

                    {trip.status === 'ASSIGNED' && (
                      <div className="mt-4">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={() => handleTripStart(trip)}
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Start Trip
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Trips</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You don't have any active trips at the moment. Accept a trip from the available requests above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
