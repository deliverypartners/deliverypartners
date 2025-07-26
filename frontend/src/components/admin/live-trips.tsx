import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, MoreHorizontal, Phone, Eye, Navigation2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface LiveTripsProps {
  trips?: any[]
}

export function LiveTrips({ trips: propTrips }: LiveTripsProps) {
  const { toast } = useToast()
  const [trackingModal, setTrackingModal] = useState<any>(null)
  
  // Use provided trips (no fallback to hardcoded data)
  const trips = propTrips || []

  // Calculate real-time stats from the actual trips data
  const liveTripsCount = trips.length
  const inProgressTrips = trips.filter(trip => trip.status === 'IN_PROGRESS' || trip.status === 'ACTIVE' || trip.status === 'ONGOING').length
  const pendingTrips = trips.filter(trip => trip.status === 'PENDING').length
  
  // Get unique active drivers from trips
  const activeDriversCount = new Set(trips.map(trip => trip.driverId || trip.driver?.id).filter(Boolean)).size
  
  // Calculate average trip time if we have trip duration data
  const completedTripsWithDuration = trips.filter(trip => trip.duration && trip.status === 'COMPLETED')
  const averageTripTime = completedTripsWithDuration.length > 0 
    ? Math.round(completedTripsWithDuration.reduce((sum, trip) => sum + trip.duration, 0) / completedTripsWithDuration.length)
    : 0

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in_progress":
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Handle tracking a specific trip
  const handleTrackTrip = (trip: any) => {
    if (trip.driver?.currentLatitude && trip.driver?.currentLongitude) {
      // Open Google Maps with driver location
      const mapsUrl = `https://www.google.com/maps?q=${trip.driver.currentLatitude},${trip.driver.currentLongitude}`
      window.open(mapsUrl, '_blank')
    } else {
      toast({
        title: "Location Unavailable",
        description: "Driver location is not available for this trip",
        variant: "destructive",
      })
    }
  }

  // Handle contacting driver
  const handleContactDriver = (trip: any) => {
    if (trip.driver?.user?.phoneNumber) {
      window.open(`tel:${trip.driver.user.phoneNumber}`, '_self')
    } else {
      toast({
        title: "Contact Unavailable",
        description: "Driver contact information is not available",
        variant: "destructive",
      })
    }
  }

  // Handle contacting customer
  const handleContactCustomer = (trip: any) => {
    if (trip.customer?.phoneNumber) {
      window.open(`tel:${trip.customer.phoneNumber}`, '_self')
    } else {
      toast({
        title: "Contact Unavailable",
        description: "Customer contact information is not available",
        variant: "destructive",
      })
    }
  }

  // Handle viewing trip details
  const handleViewDetails = (trip: any) => {
    setTrackingModal(trip)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveTripsCount}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressTrips} in progress, {pendingTrips} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDriversCount}</div>
            <p className="text-xs text-muted-foreground">Currently on trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Trip Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageTripTime > 0 ? `${averageTripTime} min` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedTripsWithDuration.length > 0 
                ? `Based on ${completedTripsWithDuration.length} completed trips`
                : 'No completed trips data'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Est. Arrival</TableHead>
              <TableHead>Location</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No active trips found
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.bookingNumber || trip.id}
                  </TableCell>
                  <TableCell>
                    {trip.customer?.fullName || trip.customerName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {trip.driver?.user?.fullName || trip.driverName || 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(trip.status)}</TableCell>
                  <TableCell>
                    {trip.startTime || trip.createdAt ? 
                      new Date(trip.startTime || trip.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {trip.estimatedArrival || trip.estimatedDeliveryTime ? 
                      new Date(trip.estimatedArrival || trip.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTrackTrip(trip)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {trip.driver?.currentLatitude && trip.driver?.currentLongitude 
                        ? `Track (${new Date(trip.driver?.lastLocationUpdate || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })})`
                        : 'No Location'
                      }
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                        <DropdownMenuItem onClick={() => handleViewDetails(trip)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContactDriver(trip)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Driver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContactCustomer(trip)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTrackTrip(trip)}>
                          <Navigation2 className="mr-2 h-4 w-4" />
                          Open in Maps
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Trip Details Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Trip Details</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTrackingModal(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Trip ID:</span> {trackingModal.bookingNumber || trackingModal.id}
              </div>
              <div>
                <span className="font-medium">Customer:</span> {trackingModal.customer?.fullName || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Driver:</span> {trackingModal.driver?.user?.fullName || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {getStatusBadge(trackingModal.status)}
              </div>
              <div>
                <span className="font-medium">From:</span> {trackingModal.pickupAddress || 'N/A'}
              </div>
              <div>
                <span className="font-medium">To:</span> {trackingModal.dropoffAddress || 'N/A'}
              </div>
              {trackingModal.driver?.currentLatitude && trackingModal.driver?.currentLongitude && (
                <div>
                  <span className="font-medium">Driver Location:</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {trackingModal.driver.currentAddress || 
                     `${trackingModal.driver.currentLatitude.toFixed(6)}, ${trackingModal.driver.currentLongitude.toFixed(6)}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(trackingModal.driver.lastLocationUpdate || Date.now()).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              {trackingModal.driver?.currentLatitude && trackingModal.driver?.currentLongitude && (
                <Button 
                  onClick={() => handleTrackTrip(trackingModal)}
                  className="flex-1"
                >
                  <Navigation2 className="h-4 w-4 mr-2" />
                  Track on Map
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setTrackingModal(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
