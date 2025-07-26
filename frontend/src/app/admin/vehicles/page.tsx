"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Edit, Plus, Search, X, Loader2 } from "lucide-react"
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
import { adminVehiclesApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

interface Vehicle {
  id: string
  vehicleType: string
  vehicleNumber: string
  vehicleModel: string
  yearOfManufacture: string
  insuranceNumber: string
  isActive: boolean
  isVerified: boolean
  registrationDocument?: string
  insuranceDocument?: string
  pollutionDocument?: string
  createdAt: string
  updatedAt: string
  driverProfile?: {
    user: {
      fullName: string
      phoneNumber: string
    }
  }
}

export default function VehiclesPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Fetch vehicles data
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching vehicles from admin API...')
      const response = await adminVehiclesApi.getVehicles()
      console.log('Vehicles API response:', response)
      
      if (response.success) {
        setVehicles(response.data || [])
        console.log('Vehicles loaded:', response.data?.length || 0)
      } else {
        const errorMessage = response.message || 'Failed to fetch vehicles'
        console.error('Failed to fetch vehicles:', errorMessage)
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error('Vehicles fetch error:', err)
      const errorMessage = err.message || 'Failed to fetch vehicles'
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

  // Filter vehicles based on search term, type, and status
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !searchTerm || 
      vehicle.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverProfile?.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || vehicle.vehicleType.toLowerCase() === typeFilter
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === 'active' && vehicle.isActive && vehicle.isVerified) ||
      (statusFilter === 'inactive' && !vehicle.isActive) ||
      (statusFilter === 'pending' && !vehicle.isVerified)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Get pending vehicles (not verified)
  const pendingVehicles = vehicles.filter(vehicle => !vehicle.isVerified)

  const getStatusBadge = (vehicle: Vehicle) => {
    if (!vehicle.isVerified) {
      return <Badge className="bg-yellow-500">Pending Approval</Badge>
    } else if (vehicle.isActive) {
      return <Badge className="bg-green-500">Active</Badge>
    } else {
      return <Badge variant="outline">Inactive</Badge>
    }
  }

  const handleVerifyVehicle = async (vehicleId: string) => {
    try {
      const response = await adminVehiclesApi.verifyVehicle(vehicleId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Vehicle verified successfully"
        })
        await fetchVehicles() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to verify vehicle",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify vehicle",
        variant: "destructive"
      })
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsEditDialogOpen(true)
  }

  const handleApproveVehicle = async (vehicleId: string) => {
    try {
      const response = await adminVehiclesApi.verifyVehicle(vehicleId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Vehicle approved successfully"
        })
        fetchVehicles()
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to approve vehicle',
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve vehicle",
        variant: "destructive"
      })
    }
  }

  const handleRejectVehicle = async (vehicleId: string) => {
    try {
      const response = await adminVehiclesApi.updateVehicleApproval(vehicleId, false)
      if (response.success) {
        toast({
          title: "Success",
          description: "Vehicle rejected successfully"
        })
        fetchVehicles() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to reject vehicle',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject vehicle",
        variant: "destructive"
      })
    }
  }

  const handleStatusToggle = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const response = await adminVehiclesApi.updateVehicleStatus(vehicleId, !currentStatus)
      if (response.success) {
        toast({
          title: "Success",
          description: `Vehicle ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        })
        fetchVehicles()
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to update vehicle status',
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vehicles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchVehicles}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter the details of the new vehicle to add it to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input id="model" placeholder="Enter vehicle model" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="minivan">Minivan</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="Enter year" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license">License Plate</Label>
                  <Input id="license" placeholder="Enter license plate" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver">Assign Driver</Label>
                <Select>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                    <SelectItem value="david">David Johnson</SelectItem>
                    <SelectItem value="michael">Michael Brown</SelectItem>
                    <SelectItem value="sarah">Sarah Davis</SelectItem>
                    <SelectItem value="james">James Wilson</SelectItem>
                    <SelectItem value="robert">Robert Taylor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Add Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Vehicles</CardTitle>
          <CardDescription>
            View and filter vehicles by type, status, or search by model or license plate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="type-filter" className="text-sm font-medium">
                Vehicle Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="search-vehicles" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-vehicles" 
                  type="search" 
                  placeholder="Search vehicles..." 
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
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>{vehicle.vehicleModel}</TableCell>
                      <TableCell className="capitalize">{vehicle.vehicleType}</TableCell>
                      <TableCell>{vehicle.vehicleNumber}</TableCell>
                      <TableCell>{vehicle.driverProfile?.user.fullName || 'Unassigned'}</TableCell>
                      <TableCell>{getStatusBadge(vehicle)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {vehicle.registrationDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/uploads/vehicle-documents/${vehicle.registrationDocument}`, '_blank')}
                            >
                              RC
                            </Button>
                          )}
                          {vehicle.insuranceDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/uploads/vehicle-documents/${vehicle.insuranceDocument}`, '_blank')}
                            >
                              Insurance
                            </Button>
                          )}
                          {vehicle.pollutionDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/uploads/vehicle-documents/${vehicle.pollutionDocument}`, '_blank')}
                            >
                              PUC
                            </Button>
                          )}
                          {!vehicle.registrationDocument && !vehicle.insuranceDocument && !vehicle.pollutionDocument && (
                            <span className="text-gray-400 text-sm">No documents</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(vehicle.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {!vehicle.isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleVerifyVehicle(vehicle.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          {vehicle.isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusToggle(vehicle.id, vehicle.isActive)}
                              className={vehicle.isActive ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-green-50 hover:bg-green-100 text-green-600"}
                            >
                              {vehicle.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>{vehicle.vehicleModel}</TableCell>
                      <TableCell className="capitalize">{vehicle.vehicleType}</TableCell>
                      <TableCell>{vehicle.vehicleNumber}</TableCell>
                      <TableCell>{vehicle.driverProfile?.user.fullName || 'Unassigned'}</TableCell>
                      <TableCell>{new Date(vehicle.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                            onClick={() => handleApproveVehicle(vehicle.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                            onClick={() => handleRejectVehicle(vehicle.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
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
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update the vehicle&apos;s information.</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-model">Vehicle Model</Label>
                  <Input id="edit-model" defaultValue={selectedVehicle.vehicleModel} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Vehicle Type</Label>
                  <Select defaultValue={selectedVehicle.vehicleType}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input id="edit-year" type="number" defaultValue={selectedVehicle.yearOfManufacture} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-license">Vehicle Number</Label>
                  <Input id="edit-license" defaultValue={selectedVehicle.vehicleNumber} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-driver">Assigned Driver</Label>
                <Select>
                  <SelectTrigger id="edit-driver">
                    <SelectValue placeholder={selectedVehicle.driverProfile?.user.fullName || 'Unassigned'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {/* TODO: Load available drivers from API */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedVehicle.isActive ? 'active' : 'inactive'}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-insurance">Insurance Number</Label>
                <Input id="edit-insurance" defaultValue={selectedVehicle.insuranceNumber} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}