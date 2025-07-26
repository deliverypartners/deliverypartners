"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Edit, Plus, Search, X, Loader2, Eye, Phone, Car } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { adminDriversApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

interface Driver {
  id: string
  user: {
    fullName: string
    email: string
    phoneNumber: string
    isActive: boolean
  }
  licenseNumber: string
  isVerified: boolean
  isOnline: boolean
  rating?: number
  totalTrips: number
  totalEarnings: number
  createdAt: string
  vehicles?: any[]
}

export default function DriversPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  // Fetch drivers data
  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminDriversApi.getDrivers()
      if (response.success) {
        setDrivers(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch drivers')
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch drivers',
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch drivers'
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

  // Filter drivers based on search term and filters
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = !searchTerm || 
      driver.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user.phoneNumber.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === 'active' && driver.isVerified && driver.user.isActive) ||
      (statusFilter === 'inactive' && (!driver.isVerified || !driver.user.isActive)) ||
      (statusFilter === 'online' && driver.isOnline) ||
      (statusFilter === 'offline' && !driver.isOnline)
    
    const matchesVerification = verificationFilter === "all" ||
      (verificationFilter === 'verified' && driver.isVerified) ||
      (verificationFilter === 'pending' && !driver.isVerified)
    
    return matchesSearch && matchesStatus && matchesVerification
  })

  // Get pending drivers (not verified)
  const pendingDrivers = drivers.filter(driver => !driver.isVerified)

  const getStatusBadge = (driver: Driver) => {
    if (!driver.isVerified) {
      return <Badge className="bg-yellow-500">Pending Verification</Badge>
    } else {
      return <Badge className="bg-green-500">Active</Badge>
    }
  }

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsEditDialogOpen(true)
  }

  const handleApproveDriver = async (driverId: string) => {
    try {
      const response = await adminDriversApi.updateDriverApproval(driverId, true)
      if (response.success) {
        toast({
          title: "Success",
          description: "Driver approved successfully"
        })
        fetchDrivers() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to approve driver',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve driver",
        variant: "destructive"
      })
    }
  }

  const handleRejectDriver = async (driverId: string) => {
    try {
      const response = await adminDriversApi.updateDriverApproval(driverId, false, 'Rejected by admin')
      if (response.success) {
        toast({
          title: "Success",
          description: "Driver rejected successfully"
        })
        fetchDrivers() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to reject driver',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject driver",
        variant: "destructive"
      })
    }
  }

  const handleToggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const response = await adminDriversApi.updateDriverStatus(driverId, !currentStatus)
      if (response.success) {
        toast({
          title: "Success",
          description: `Driver ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        })
        fetchDrivers() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to update driver status',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading drivers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDrivers}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Driver Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Drivers</CardTitle>
          <CardDescription>
            View and filter drivers by status, verification, or search by name, email, or license.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="verification-filter" className="text-sm font-medium">
                Verification
              </label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger id="verification-filter">
                  <SelectValue placeholder="All verification" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="search-drivers" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-drivers" 
                  type="search" 
                  placeholder="Search drivers..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Drivers ({filteredDrivers.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingDrivers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.user.fullName}</TableCell>
                      <TableCell>{driver.user.email}</TableCell>
                      <TableCell>{driver.user.phoneNumber}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{driver.rating ? driver.rating.toFixed(1) : 'N/A'}</TableCell>
                      <TableCell>{driver.totalTrips}</TableCell>
                      <TableCell>₹{driver.totalEarnings.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(driver)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                            <DropdownMenuItem onClick={() => handleEditDriver(driver)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`tel:${driver.user.phoneNumber}`, '_self')}>
                              <Phone className="mr-2 h-4 w-4" />
                              Contact Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/admin/vehicles')}>
                              <Car className="mr-2 h-4 w-4" />
                              View Vehicles
                            </DropdownMenuItem>
                           
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.user.fullName}</TableCell>
                      <TableCell>{driver.user.email}</TableCell>
                      <TableCell>{driver.user.phoneNumber}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{new Date(driver.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                            onClick={() => handleApproveDriver(driver.id)}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                            onClick={() => handleRejectDriver(driver.id)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>View and manage driver information.</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input value={selectedDriver.user.fullName} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={selectedDriver.user.email} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input value={selectedDriver.user.phoneNumber} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>License Number</Label>
                  <Input value={selectedDriver.licenseNumber} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Total Trips</Label>
                  <Input value={selectedDriver.totalTrips.toString()} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Rating</Label>
                  <Input value={selectedDriver.rating?.toFixed(1) || 'N/A'} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Total Earnings</Label>
                  <Input value={`₹${selectedDriver.totalEarnings.toFixed(2)}`} readOnly />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
