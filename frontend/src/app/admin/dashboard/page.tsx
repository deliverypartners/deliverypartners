"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, Car, DollarSign, TrendingUp } from "lucide-react"
import { LiveTrips } from "@/components/admin/live-trips"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { BookingStatusChart } from "@/components/admin/booking-status-chart"
import { adminDashboardApi, adminUsersApi, adminBookingsApi, adminVehiclesApi } from "@/lib/admin-api"

interface DashboardStats {
  totalUsers: number
  totalDrivers: number
  totalBookings: number
  totalVehicles: number
  todayBookings: number
  activeDrivers: number
  pendingBookings: number
  totalRevenue: number
  recentBookings: any[]
  activeTrips: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalVehicles: 0,
    todayBookings: 0,
    activeDrivers: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    activeTrips: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin token exists
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Try to fetch admin dashboard stats to verify token is valid
        const dashboardData = await adminDashboardApi.getStats();
        
        if (dashboardData.success) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, remove it and redirect
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token is invalid, remove it and redirect
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      }
    }
    
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        
        // Try to fetch dashboard stats from admin API first
        let dashboardData;
        try {
          dashboardData = await adminDashboardApi.getStats()
        } catch (dashboardError) {
          console.warn('Dashboard API failed, falling back to individual APIs:', dashboardError)
          dashboardData = { success: false }
        }

        // If dashboard API fails, fetch from individual endpoints
        let usersData, bookingsData, vehiclesData, activeTripsData;
        if (!dashboardData.success) {
          try {
            [usersData, bookingsData, vehiclesData, activeTripsData] = await Promise.all([
              adminUsersApi.getUsers(1, 1), // Just get count
              adminBookingsApi.getBookings(1, 10), // Get recent bookings
              adminVehiclesApi.getVehicles(), // Get vehicles
              Promise.all([
                adminBookingsApi.getBookings(1, 50, 'IN_PROGRESS'), // Get in-progress trips
                adminBookingsApi.getBookings(1, 50, 'ACTIVE'), // Get active trips
                adminBookingsApi.getBookings(1, 50, 'ONGOING') // Get ongoing trips
              ])
            ])
          } catch (apiError) {
            console.warn('Individual APIs failed, using fallback data:', apiError)
            activeTripsData = null
          }
        } else {
          // Also fetch recent bookings and active trips for the dashboard
          try {
            [bookingsData, activeTripsData] = await Promise.all([
              adminBookingsApi.getBookings(1, 10),
              Promise.all([
                adminBookingsApi.getBookings(1, 50, 'IN_PROGRESS'),
                adminBookingsApi.getBookings(1, 50, 'ACTIVE'), 
                adminBookingsApi.getBookings(1, 50, 'ONGOING')
              ])
            ])
          } catch (bookingsError) {
            console.warn('Bookings API failed:', bookingsError)
            bookingsData = { data: { bookings: [] } }
            activeTripsData = null
          }
        }

        // Calculate revenue from bookings
        const revenue = bookingsData?.data?.bookings?.reduce((sum: number, booking: any) => {
          return sum + (booking.totalAmount || booking.amount || 0)
        }, 0) || 0

        // Combine all active trips from different statuses
        let activeTrips = []
        if (activeTripsData) {
          const [inProgressTrips, activeTripsResponse, ongoingTrips] = activeTripsData
          activeTrips = [
            ...(inProgressTrips?.data?.bookings || []),
            ...(activeTripsResponse?.data?.bookings || []),
            ...(ongoingTrips?.data?.bookings || [])
          ]
          // Remove duplicates based on ID
          activeTrips = activeTrips.filter((trip, index, self) => 
            index === self.findIndex(t => t.id === trip.id)
          )
        } else {
          // Fallback to filtering from general bookings
          activeTrips = bookingsData?.data?.bookings?.filter((b: any) => 
            b.status === 'IN_PROGRESS' || b.status === 'ACTIVE' || b.status === 'ONGOING'
          ) || []
        }

        if (dashboardData.success) {
          // Use dashboard API data
          setStats({
            totalUsers: dashboardData.data.totalUsers || 0,
            totalDrivers: dashboardData.data.totalDrivers || 0,
            totalBookings: dashboardData.data.totalBookings || 0,
            totalVehicles: dashboardData.data.totalVehicles || 0,
            todayBookings: dashboardData.data.todayBookings || 0,
            activeDrivers: dashboardData.data.activeDrivers || 0,
            pendingBookings: dashboardData.data.pendingBookings || 0,
            totalRevenue: dashboardData.data.totalRevenue || revenue,
            recentBookings: bookingsData?.data?.bookings || [],
            activeTrips: activeTrips
          })
        } else {
          // Use individual API data or fallback
          setStats({
            totalUsers: usersData?.data?.total || 0,
            totalDrivers: 0, // Will be calculated from users with driver role
            totalBookings: bookingsData?.data?.total || 0,
            totalVehicles: vehiclesData?.data?.total || 0,
            todayBookings: 0, // Would need date filtering
            activeDrivers: 0, // Would need real-time data
            pendingBookings: bookingsData?.data?.bookings?.filter((b: any) => b.status === 'PENDING')?.length || 0,
            totalRevenue: revenue,
            recentBookings: bookingsData?.data?.bookings || [],
            activeTrips: activeTrips
          })
        }
        
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
        // Set fallback data
        setStats({
          totalUsers: 0,
          totalDrivers: 0,
          totalBookings: 0,
          totalVehicles: 0,
          todayBookings: 0,
          activeDrivers: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          recentBookings: [],
          activeTrips: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Set up periodic refresh for active trips (every 30 seconds)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchDashboardData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>Warning: {error}</p>
          <p className="text-sm">Showing fallback data. Some features may not work.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Platform vehicles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDrivers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">Bookings today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Trips</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-trips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-trips">Live Trips ({stats.activeTrips.length})</TabsTrigger>
          
        </TabsList>
        <TabsContent value="live-trips" className="space-y-4">
          <LiveTrips trips={stats.activeTrips} />
        </TabsContent>
        
      </Tabs>
    </div>
  )
}
