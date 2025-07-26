
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip } from './ActiveTripsTab';

interface CompletedTripsTabProps {
  trips: Trip[];
}

export const CompletedTripsTab = ({ trips }: CompletedTripsTabProps) => {
  const completedTrips = trips.filter(trip => trip.status === 'COMPLETED');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip History</CardTitle>
        <CardDescription>
          View all your completed deliveries and earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Dropoff</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Your Earning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedTrips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">{trip.booking.bookingNumber}</TableCell>
                <TableCell>{trip.booking.pickupAddress}</TableCell>
                <TableCell>{trip.booking.dropoffAddress}</TableCell>
                <TableCell>{trip.endTime ? new Date(trip.endTime).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>₹{trip.booking.actualFare || trip.booking.estimatedFare}</TableCell>
                <TableCell>₹{trip.commission || 0}</TableCell>
                <TableCell>₹{trip.driverAmount || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell>₹{completedTrips.reduce((acc, trip) => acc + (trip.booking.actualFare || trip.booking.estimatedFare), 0)}</TableCell>
              <TableCell>₹{completedTrips.reduce((acc, trip) => acc + (trip.commission || 0), 0)}</TableCell>
              <TableCell>₹{completedTrips.reduce((acc, trip) => acc + (trip.driverAmount || 0), 0)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};
