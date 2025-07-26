"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { ArrowLeft, Truck, Navigation, Wallet, History, Package, Settings, Menu, User, LogOut } from 'lucide-react';

// Import refactored components with named exports
import { ActiveTripsTab } from '@/components/driver/ActiveTripsTab';
import { CompletedTripsTab } from '@/components/driver/CompletedTripsTab';
import { WalletTab } from '@/components/driver/WalletTab';
import { VehicleTab } from '@/components/driver/VehicleTab';
import { TripUpdateTab } from '@/components/driver/TripUpdateTab';
import { ProfileTab } from '@/components/driver/ProfileTab';

import { useDriverData } from '@/hooks/use-driver-data';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AuthRedirect } from '@/components/auth-redirect';

export default function DriverPanelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    driverProfile,
    trips,
    earnings,
    vehicles,
    isLoading,
    error,
    updateOnlineStatus,
    updateLocation,
    refreshData,
    addVehicle,
  } = useDriverData();

  const [activeTab, setActiveTab] = useState("active-trips");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    // Clear auth tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    // Redirect to login page
    router.push('/auth');
  }, [router]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent going back to previous page, redirect to login instead
      event.preventDefault();
      handleLogout();
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopState);

    // Push a state to prevent immediate back navigation
    window.history.pushState(null, '', window.location.href);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleLogout]);

  const navigationItems = [
    { id: "active-trips", label: "Active Trips", icon: Package },
    { id: "completed-trips", label: "Trip History", icon: History },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "vehicle", label: "Vehicle", icon: Truck },
    { id: "trip-update", label: "Location", icon: Navigation },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  const handleUpdateLocation = async (bookingId: string, latitude: number, longitude: number) => {
    try {
      await updateLocation(bookingId, { latitude, longitude });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async () => {
    if (!driverProfile) return;
    
    try {
      await updateOnlineStatus(!driverProfile.isOnline);
      toast({
        title: "Status Updated",
        description: `You are now ${!driverProfile.isOnline ? 'online' : 'offline'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading driver data...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard for new drivers
  if (!driverProfile) {
    return (
      <AuthRedirect requiredRole="DRIVER">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Driver Panel!</h1>
            <p className="text-gray-600 mb-6">
              Your driver profile is being set up. Please refresh the page or complete your profile setup.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => refreshData()}
                className="w-full"
              >
                Reload Data
              </Button>
            </div>
          </div>
        </div>
      </AuthRedirect>
    );
  }

  const activeTrips = trips.filter(trip => trip.status !== 'COMPLETED');
  const completedTrips = trips.filter(trip => trip.status === 'COMPLETED');

  return (
    <AuthRedirect requiredRole="DRIVER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Back/Logout Button */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Login</span>
                </Button>
              </div>

              {/* Title */}
              <div className="flex-1 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Driver Panel</h1>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange(item.id)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  
                  {/* Logout Button in Mobile Menu */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="flex items-center space-x-2 px-4 py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="space-y-6">
            {/* Active Trips Tab */}
            <TabsContent value="active-trips" className="mt-0">
              <ActiveTripsTab
                trips={trips}
              />
            </TabsContent>

            {/* Completed Trips Tab */}
            <TabsContent value="completed-trips" className="mt-0">
              <CompletedTripsTab trips={trips} />
            </TabsContent>
            
            {/* Wallet Tab */}
            <TabsContent value="wallet" className="mt-0">
              <WalletTab 
                earnings={earnings}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Vehicle Tab */}
            <TabsContent value="vehicle" className="mt-0">
              <VehicleTab 
                vehicles={vehicles}
                onRefresh={refreshData}
                onAddVehicle={addVehicle}
              />
            </TabsContent>
            
            {/* Trip Update Tab */}
            <TabsContent value="trip-update" className="mt-0">
              <TripUpdateTab 
                activeTrips={activeTrips}
                onUpdateLocation={handleUpdateLocation}
              />
            </TabsContent>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <ProfileTab 
                driverProfile={driverProfile}
                isLoading={isLoading}
                onUpdateProfile={async (data) => {
                  // TODO: Implement update profile functionality
                  console.log('Update profile:', data);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
    </AuthRedirect>
  );
}
