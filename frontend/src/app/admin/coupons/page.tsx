"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Search, Trash, Eye, EyeOff, AlertCircle } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { adminCouponsApi } from "@/lib/admin-api"
import { Coupon, CreateCouponRequest, UpdateCouponRequest, CouponsResponse } from "@/types/admin"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  const [formData, setFormData] = useState<CreateCouponRequest>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxDiscount: undefined,
    validFrom: '',
    validTo: '',
    usageLimitPerUser: undefined,
    status: 'ACTIVE'
  })
  const [editFormData, setEditFormData] = useState<UpdateCouponRequest>({})

  const { toast } = useToast()

  // Fetch coupons
  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response: CouponsResponse = await adminCouponsApi.getCoupons(
        page,
        pagination.limit,
        filters.status || undefined
      )
      
      setCoupons(response.coupons)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch coupons')
      console.error('Failed to fetch coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load coupons on component mount
  useEffect(() => {
    fetchCoupons()
  }, [filters.status])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search) {
        // For now, we'll filter on frontend. Backend can be enhanced to support search
        const filtered = coupons.filter(coupon => 
          coupon.code.toLowerCase().includes(filters.search.toLowerCase())
        )
        // This is a simplified search - in production, implement backend search
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  const handleCreateCoupon = async () => {
    try {
      if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validTo) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive",
        })
        return
      }

      if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
        toast({
          title: "Validation Error", 
          description: "Valid from date must be before valid to date",
          variant: "destructive",
        })
        return
      }

      const couponData: CreateCouponRequest = {
        ...formData,
        maxDiscount: formData.maxDiscount || undefined,
        usageLimitPerUser: formData.usageLimitPerUser || undefined
      }

      await adminCouponsApi.createCoupon(couponData)
      
      toast({
        title: "Success",
        description: "Coupon created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        maxDiscount: undefined,
        validFrom: '',
        validTo: '',
        usageLimitPerUser: undefined,
        status: 'ACTIVE'
      })
      fetchCoupons()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create coupon",
        variant: "destructive",
      })
    }
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setEditFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount || undefined,
      validFrom: coupon.validFrom.split('T')[0], // Extract date part
      validTo: coupon.validTo.split('T')[0],
      usageLimitPerUser: coupon.usageLimitPerUser || undefined,
      status: coupon.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return

    try {
      if (editFormData.validFrom && editFormData.validTo) {
        if (new Date(editFormData.validFrom) >= new Date(editFormData.validTo)) {
          toast({
            title: "Validation Error",
            description: "Valid from date must be before valid to date",
            variant: "destructive",
          })
          return
        }
      }

      const updateData: UpdateCouponRequest = {
        ...editFormData,
        maxDiscount: editFormData.maxDiscount || undefined,
        usageLimitPerUser: editFormData.usageLimitPerUser || undefined
      }

      await adminCouponsApi.updateCoupon(selectedCoupon.id, updateData)
      
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedCoupon(null)
      setEditFormData({})
      fetchCoupons()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update coupon",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return
    }

    try {
      await adminCouponsApi.deleteCoupon(coupon.id)
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      })

      fetchCoupons()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete coupon",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await adminCouponsApi.toggleCouponStatus(coupon.id)
      
      toast({
        title: "Success",
        description: `Coupon ${coupon.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully`,
      })

      fetchCoupons()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to toggle coupon status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>
      case "INACTIVE":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`
    } else {
      return `$${coupon.discountValue}`
    }
  }

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.validTo) < new Date()
  }

  if (loading && coupons.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Coupon Management</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading coupons...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
              <DialogDescription>Create a new coupon code for your customers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g., SUMMER25" 
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discount-type">Discount Type *</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value as 'PERCENTAGE' | 'FIXED_AMOUNT' }))}
                  >
                    <SelectTrigger id="discount-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount-value">
                    Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                  </Label>
                  <Input 
                    id="discount-value" 
                    type="number" 
                    placeholder={formData.discountType === 'PERCENTAGE' ? "e.g., 25" : "e.g., 10"} 
                    value={formData.discountValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-discount">Max Discount ($)</Label>
                  <Input 
                    id="max-discount" 
                    type="number" 
                    placeholder="e.g., 50" 
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valid-from">Valid From *</Label>
                  <Input 
                    id="valid-from" 
                    type="date" 
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valid-to">Valid To *</Label>
                  <Input 
                    id="valid-to" 
                    type="date" 
                    value={formData.validTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="usage-limit">Usage Limit Per User</Label>
                  <Input 
                    id="usage-limit" 
                    type="number" 
                    placeholder="e.g., 1 (leave empty for unlimited)" 
                    value={formData.usageLimitPerUser || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimitPerUser: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCoupon}>Add Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Coupons</CardTitle>
          <CardDescription>View and filter coupons by status or search by code.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="search-coupons" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search-coupons" 
                  type="search" 
                  placeholder="Search coupons..." 
                  className="pl-8" 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coupon List</CardTitle>
          <CardDescription>
            Manage your discount coupons and promotions. 
            {pagination.total > 0 && ` Showing ${coupons.length} of ${pagination.total} coupons.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-muted-foreground">No coupons found</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Max Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Usage Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons
                  .filter(coupon => 
                    !filters.search || 
                    coupon.code.toLowerCase().includes(filters.search.toLowerCase())
                  )
                  .map((coupon) => (
                    <TableRow key={coupon.id} className={isExpired(coupon) ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">
                        {coupon.code}
                        {isExpired(coupon) && <Badge variant="outline" className="ml-2 text-xs">Expired</Badge>}
                      </TableCell>
                      <TableCell>{formatDiscount(coupon)}</TableCell>
                      <TableCell>{coupon.maxDiscount ? `$${coupon.maxDiscount}` : 'No limit'}</TableCell>
                      <TableCell>
                        {formatDate(coupon.validFrom)} to {formatDate(coupon.validTo)}
                      </TableCell>
                      <TableCell>
                        {coupon.usageLimitPerUser || "Unlimited"}
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCoupon(coupon)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleStatus(coupon)}
                            title={coupon.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.status === 'ACTIVE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">Toggle Status</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => fetchCoupons(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => fetchCoupons(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update the coupon&apos;s details.</DialogDescription>
          </DialogHeader>
          {selectedCoupon && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-code">Coupon Code</Label>
                  <Input 
                    id="edit-code" 
                    value={editFormData.code || ''} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-discount-type">Discount Type</Label>
                  <Select 
                    value={editFormData.discountType} 
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, discountType: value as 'PERCENTAGE' | 'FIXED_AMOUNT' }))}
                  >
                    <SelectTrigger id="edit-discount-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-discount-value">
                    Discount Value {editFormData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                  </Label>
                  <Input 
                    id="edit-discount-value" 
                    type="number"
                    value={editFormData.discountValue || ''} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-max-discount">Max Discount ($)</Label>
                  <Input 
                    id="edit-max-discount" 
                    type="number"
                    value={editFormData.maxDiscount || ''} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, maxDiscount: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-valid-from">Valid From</Label>
                  <Input 
                    id="edit-valid-from" 
                    type="date" 
                    value={editFormData.validFrom || ''} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-valid-to">Valid To</Label>
                  <Input 
                    id="edit-valid-to" 
                    type="date" 
                    value={editFormData.validTo || ''} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-usage-limit">Usage Limit Per User</Label>
                  <Input 
                    id="edit-usage-limit" 
                    type="number" 
                    value={editFormData.usageLimitPerUser || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, usageLimitPerUser: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editFormData.status} 
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' }))}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCoupon}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
