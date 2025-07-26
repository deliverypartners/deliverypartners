"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Loader2, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/admin/date-picker"
import { Input } from "@/components/ui/input"
import { adminBookingsApi } from "@/lib/admin-api"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  bookingNumber: string
  customerName: string
  driverName?: string
  amount: number
  actualFare?: number
  estimatedFare: number
  commission: number
  driverAmount?: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  status: string
}

export default function TransactionsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // We'll use bookings data to create transaction records since there's no separate transactions endpoint
      const response = await adminBookingsApi.getBookings(1, 100)
      if (response.success) {
        const bookings = response.data?.bookings || []
        // Transform bookings into transaction format
        const transactionData = bookings
          .filter((booking: any) => booking.status === 'COMPLETED' && booking.actualFare) // Only completed bookings with payment
          .map((booking: any) => ({
            id: `T-${booking.id.slice(-6)}`,
            bookingNumber: booking.bookingNumber,
            customerName: booking.customer?.fullName || 'Unknown',
            driverName: booking.driver?.user?.fullName || 'Unassigned',
            amount: booking.actualFare || booking.estimatedFare,
            actualFare: booking.actualFare,
            estimatedFare: booking.estimatedFare,
            commission: booking.commission || 0,
            driverAmount: booking.driverAmount || (booking.actualFare * 0.8), // Assume 80% goes to driver if not specified
            paymentMethod: booking.paymentMethod || 'CASH',
            paymentStatus: booking.paymentStatus || 'COMPLETED',
            createdAt: booking.createdAt,
            status: booking.status
          }))
        setTransactions(transactionData)
      } else {
        throw new Error(response.message || 'Failed to fetch transactions')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || transaction.paymentStatus.toLowerCase() === statusFilter
    const matchesPaymentMethod = paymentMethodFilter === "all" || transaction.paymentMethod.toLowerCase() === paymentMethodFilter
    
    const transactionDate = new Date(transaction.createdAt)
    const matchesDateRange = (!startDate || transactionDate >= startDate) && 
                            (!endDate || transactionDate <= endDate)
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange
  })

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
        return <Badge className="bg-green-500">Completed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "REFUNDED":
        return <Badge variant="outline">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const exportTransactions = () => {
    const headers = ['Transaction ID', 'Booking ID', 'Customer', 'Driver', 'Amount', 'Commission', 'Driver Amount', 'Payment Method', 'Status', 'Date']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        transaction.id,
        transaction.bookingNumber,
        transaction.customerName,
        transaction.driverName || 'N/A',
        transaction.amount,
        transaction.commission,
        transaction.driverAmount,
        transaction.paymentMethod,
        transaction.paymentStatus,
        new Date(transaction.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalCommission = filteredTransactions.reduce((sum, t) => sum + t.commission, 0)
  const totalDriverPayouts = filteredTransactions.reduce((sum, t) => sum + (t.driverAmount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={exportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {filteredTransactions.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDriverPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid to drivers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Filter transactions by date, status, or payment method.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="grid gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
              <DatePicker 
                id="end-date" 
                selected={endDate} 
                onSelect={setEndDate} 
                placeholder="Select end date" 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="payment-method" className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="search" className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Search transactions..."
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
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A detailed list of all payment transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Driver Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.bookingNumber}</TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>{transaction.driverName || 'N/A'}</TableCell>
                    <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>₹{transaction.commission.toFixed(2)}</TableCell>
                    <TableCell>₹{(transaction.driverAmount || 0).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{transaction.paymentMethod.toLowerCase()}</TableCell>
                    <TableCell>{getStatusBadge(transaction.paymentStatus)}</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
