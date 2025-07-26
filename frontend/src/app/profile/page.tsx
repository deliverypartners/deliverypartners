"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { userApi, tokenManager } from "@/lib/api";
import { MapPin, Clock, Truck, Phone, Navigation, Eye } from "lucide-react";

const customerProfileSchema = z.object({
  preferredPaymentMethod: z.string().optional(),
  defaultAddress: z.string().optional(),
  loyaltyPoints: z.number().min(0).optional(),
});

type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      preferredPaymentMethod: "",
      defaultAddress: "",
      loyaltyPoints: 0,
    },
  });

  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      router.push("/auth");
      return;
    }

    loadUserProfile();
    loadCustomerProfile();
    loadTripHistory();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const loadCustomerProfile = async () => {
    try {
      const response = await userApi.getCustomerProfile();
      if (response.success && response.data) {
        setCustomerProfile(response.data);
        form.reset({
          preferredPaymentMethod: response.data.preferredPaymentMethod || "",
          defaultAddress: response.data.defaultAddress || "",
          loyaltyPoints: response.data.loyaltyPoints || 0,
        });
      }
    } catch (error) {
      console.error("Customer profile not found, can create new one");
    }
  };

  const loadTripHistory = async () => {
    setLoadingTrips(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;
      const token = tokenManager.getToken();
      
      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setTripHistory(result.data || []);
      } else {
        console.error("Failed to load trip history:", result.message);
      }
    } catch (error) {
      console.error("Error loading trip history:", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <Eye className="h-4 w-4" />;
      case 'picked_up':
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canTrack = (status: string) => {
    const trackableStatuses = ['confirmed', 'picked_up', 'in_transit'];
    return trackableStatuses.includes(status.toLowerCase());
  };

  const onSubmit = async (data: CustomerProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await userApi.createCustomerProfile(data);
      
      if (response.success) {
        setCustomerProfile(response.data);
        toast({
          title: "Profile Updated",
          description: "Your customer profile has been saved successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userApi.getProfile(); // Just to test the token
      tokenManager.removeToken();
      router.push("/auth");
    } catch (error) {
      tokenManager.removeToken();
      router.push("/auth");
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account and view trip history</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="trips">Trip History</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{userProfile.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{userProfile.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-gray-900 capitalize">{userProfile.role.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Trip History Tab */}
            <TabsContent value="trips" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Trip History</h2>
                  <Button 
                    onClick={loadTripHistory} 
                    variant="outline" 
                    size="sm"
                    disabled={loadingTrips}
                  >
                    {loadingTrips ? "Loading..." : "Refresh"}
                  </Button>
                </div>

                {loadingTrips ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading trips...</p>
                  </div>
                ) : tripHistory.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                      <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
                      <Link href="/">
                        <Button>Book Your First Trip</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tripHistory.map((trip, index) => (
                      <Card key={trip.id || index}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {trip.serviceType && trip.serviceType.replace('_', ' ')} Booking
                              </CardTitle>
                              <CardDescription>
                                Booking #{trip.bookingNumber || trip.id}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getStatusColor(trip.status)} flex items-center space-x-1`}>
                                {getStatusIcon(trip.status)}
                                <span className="capitalize">{trip.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Pickup Location */}
                            <div className="flex items-start space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Pickup</p>
                                <p className="text-gray-900">{trip.pickupAddress}</p>
                              </div>
                            </div>

                            {/* Drop Location */}
                            <div className="flex items-start space-x-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Drop</p>
                                <p className="text-gray-900">{trip.dropoffAddress}</p>
                              </div>
                            </div>

                            {/* Vehicle Info */}
                            {trip.vehicleName && (
                              <div className="flex items-center space-x-3">
                                <Truck className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Vehicle</p>
                                  <p className="text-gray-900">{trip.vehicleName}</p>
                                </div>
                              </div>
                            )}

                            {/* Date and Time */}
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Pickup Time</p>
                                <p className="text-gray-900">{formatDate(trip.pickupDateTime)}</p>
                              </div>
                            </div>

                            {/* Contact Info */}
                            {trip.customerPhone && (
                              <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Contact</p>
                                  <p className="text-gray-900">{trip.customerPhone}</p>
                                </div>
                              </div>
                            )}

                            {/* Fare */}
                            
                          </div>

                          {/* Track Button */}
                          <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Link href={`/ride-status?bookingId=${trip.id}`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Navigation className="h-4 w-4 mr-2" />
                                Track Now
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}