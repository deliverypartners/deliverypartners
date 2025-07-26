"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/admin/date-picker"
import { Download, Filter, Search, Loader2, Eye, Edit, User, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { adminBookingsApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  bookingNumber: string
  serviceType: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  estimatedFare: number
  actualFare?: number
  paymentMethod: string
  paymentStatus: string
  vehicleName?: string
  vehicleType?: string
  createdAt: string
  customer: {
    fullName: string
    phoneNumber: string
  }
  driver?: {
    user: {
      fullName: string
      phoneNumber: string
    }
  }
}

export default function BookingsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const { toast } = useToast()

  // Fetch bookings data
  useEffect(() => {
    fetchBookings()
    fetchDrivers() // Fetch drivers on component mount
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminBookingsApi.getBookings(1, 100) // Get more bookings for better filtering
      
      if (response.success) {
        setBookings(response.data?.bookings || [])
      } else {
        setError(response.message || 'Failed to fetch bookings')
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch bookings',
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch bookings'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch drivers for assignment dropdown
  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/admin/drivers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDrivers(result.data || []);
      } else {
        console.error('Failed to fetch drivers:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Filter bookings based on search term, status, and date range
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.driver?.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter
    
    const bookingDate = new Date(booking.pickupDateTime)
    const matchesDateRange = (!startDate || bookingDate >= startDate) && 
                            (!endDate || bookingDate <= endDate)
    
    return matchesSearch && matchesStatus && matchesDateRange
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "DRIVER_ARRIVED":
        return <Badge className="bg-indigo-500">Driver Arrived</Badge>
      case "DRIVER_ASSIGNED":
        return <Badge className="bg-purple-500">Driver Assigned</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "CONFIRMED":
        return <Badge className="bg-cyan-500">Confirmed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAssignDriver = async (bookingId: string, driverId: string) => {
    try {
      const response = await adminBookingsApi.assignDriver(bookingId, driverId);
      
      if (response.success) {
        toast({ title: "Success", description: "Driver assigned successfully" });
        fetchBookings(); // Refresh bookings
      } else {
        toast({ 
          title: "Error", 
          description: response.message || 'Failed to assign driver', 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: 'Failed to assign driver', 
        variant: "destructive" 
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await adminBookingsApi.updateBookingStatus(bookingId, 'CANCELLED');
      if (response.success) {
        toast({ title: "Success", description: "Booking cancelled successfully" });
        fetchBookings();
      } else {
        toast({ title: "Error", description: response.message || 'Failed to cancel booking', variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel booking", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Booking ID', 'Customer', 'Driver', 'Pickup Date', 'Pickup Address', 'Dropoff Address', 'Amount', 'Status']
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(booking => [
        booking.bookingNumber,
        booking.customer.fullName,
        booking.driver?.user.fullName || 'Unassigned',
        new Date(booking.pickupDateTime).toLocaleDateString(),
        `"${booking.pickupAddress}"`,
        `"${booking.dropoffAddress}"`,
        booking.actualFare || booking.estimatedFare,
        booking.status
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchBookings}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
          <CardDescription>View and filter booking details by date, status, or search terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <DatePicker id="end-date" selected={endDate} onSelect={setEndDate} placeholder="Select end date" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search" 
                  type="search" 
                  placeholder="Search bookings..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking List</CardTitle>
          <CardDescription>A list of all bookings with their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                  <TableCell>{booking.customer.fullName}</TableCell>
                  <TableCell>
                    {booking.driver?.user.fullName || (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Unassigned</span>
                        {booking.status === 'PENDING' && (
                          <Select onValueChange={(driverId) => handleAssignDriver(booking.id, driverId)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                              {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.vehicleName ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{booking.vehicleName}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {booking.serviceType?.replace('_', ' ').toLowerCase() || 'N/A'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {booking.serviceType === 'BIKE_DELIVERY' ? '2 Wheeler' : 
                         booking.serviceType === 'TRUCK_DELIVERY' ? 'Truck' : 
                         booking.serviceType === 'PACKERS_MOVERS' ? 'Packers & Movers' : 'N/A'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(booking.pickupDateTime).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</TableCell>
                  <TableCell>₹{(booking.actualFare || booking.estimatedFare).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Filter className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                        <DropdownMenuItem onClick={() => setSelectedBookingForDetails(booking)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {booking.status === 'PENDING' && !booking.driver && (
                          <DropdownMenuItem onClick={() => setSelectedBookingForAssignment(booking.id)}>
                            <User className="mr-2 h-4 w-4" />
                            Assign Driver
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Customer
                        </DropdownMenuItem>
                        {booking.driver && (
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Contact Driver
                          </DropdownMenuItem>
                        )}
                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <DropdownMenuItem 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600"
                          >
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBookingForDetails} onOpenChange={() => setSelectedBookingForDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - #{selectedBookingForDetails?.bookingNumber}</DialogTitle>
          </DialogHeader>
          {selectedBookingForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Trip Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Service Type</p>
                      <p className="font-medium">{selectedBookingForDetails.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Address</p>
                      <p className="font-medium">{selectedBookingForDetails.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Drop Address</p>
                      <p className="font-medium">{selectedBookingForDetails.dropoffAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Date & Time</p>
                      <p className="font-medium text-blue-600">
                        {new Date(selectedBookingForDetails.pickupDateTime).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedBookingForDetails.status)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Customer & Driver</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium">{selectedBookingForDetails.customer.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Phone</p>
                      <p className="font-medium">{selectedBookingForDetails.customer.phoneNumber}</p>
                    </div>
                    {selectedBookingForDetails.driver ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Driver Name</p>
                          <p className="font-medium">{selectedBookingForDetails.driver.user.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Driver Phone</p>
                          <p className="font-medium">{selectedBookingForDetails.driver.user.phoneNumber}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500">Driver</p>
                        <p className="font-medium text-amber-600">Not assigned yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Estimated Fare</p>
                      <p className="font-medium">₹{selectedBookingForDetails.estimatedFare.toFixed(2)}</p>
                    </div>
                    {selectedBookingForDetails.actualFare && (
                      <div>
                        <p className="text-sm text-gray-500">Actual Fare</p>
                        <p className="font-medium">₹{selectedBookingForDetails.actualFare.toFixed(2)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{selectedBookingForDetails.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-medium">{selectedBookingForDetails.paymentStatus}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Booking Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Booking Created</p>
                      <p className="font-medium">
                        {new Date(selectedBookingForDetails.createdAt).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Pickup</p>
                      <p className="font-medium text-blue-600">
                        {new Date(selectedBookingForDetails.pickupDateTime).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
