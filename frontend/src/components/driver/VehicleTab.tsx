import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { File, Upload, Car, Truck, Bike, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { vehicleApi } from '@/lib/api';

// Define validation schema for vehicle onboarding
const vehicleOnboardingSchema = z.object({
  vehicleType: z.enum(["BIKE", "AUTO", "CAR", "TRUCK", "VAN"]),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  yearOfManufacture: z.string().min(1, "Year is required"),
  insuranceNumber: z.string().min(1, "Insurance number is required"),
});

// Define the type for form data
type VehicleFormData = z.infer<typeof vehicleOnboardingSchema>;

export interface Vehicle {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel: string;
  yearOfManufacture: string;
  insuranceNumber: string;
  isActive: boolean;
  isVerified: boolean;
  registrationDocument?: string;
  insuranceDocument?: string;
  pollutionDocument?: string;
}

interface VehicleTabProps {
  vehicles: Vehicle[];
  onRefresh: () => Promise<void>;
  onAddVehicle?: (vehicleData: any) => Promise<any>;
}

export const VehicleTab = ({ vehicles, onRefresh, onAddVehicle }: VehicleTabProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    hasProfile: boolean;
    isLoading: boolean;
    userRole?: string;
  }>({
    isAuthenticated: false,
    hasProfile: false,
    isLoading: true,
  });

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setAuthStatus({
          isAuthenticated: false,
          hasProfile: false,
          isLoading: false,
        });
        return;
      }

      try {
        // Check driver profile
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/drivers/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          setAuthStatus({
            isAuthenticated: true,
            hasProfile: true,
            isLoading: false,
            userRole: 'DRIVER',
          });
        } else if (profileResponse.status === 404) {
          setAuthStatus({
            isAuthenticated: true,
            hasProfile: false,
            isLoading: false,
            userRole: 'DRIVER',
          });
        } else {
          setAuthStatus({
            isAuthenticated: false,
            hasProfile: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        setAuthStatus({
          isAuthenticated: false,
          hasProfile: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Vehicle onboarding form
  const vehicleOnboardingForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleOnboardingSchema),
    defaultValues: {
      vehicleType: "BIKE" as const,
      vehicleNumber: "",
      vehicleModel: "",
      yearOfManufacture: "",
      insuranceNumber: "",
    },
  });

  // Handle vehicle onboarding submission
  const onVehicleOnboardingSubmit = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check authentication first
      const token = localStorage.getItem('authToken');
      console.log('Token check:', { 
        hasToken: !!token, 
        tokenLength: token?.length, 
        tokenStart: token?.substring(0, 20) + '...' 
      });
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in as a driver to register a vehicle. Go to the auth page to login.",
          variant: "destructive"
        });
        // Redirect to auth page
        window.location.href = '/auth';
        return;
      }
      
      console.log('Authentication token found:', !!token);
      
      // Check if user is a driver by making a quick profile check
      try {
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/drivers/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Driver profile check status:', profileResponse.status);
        
        if (profileResponse.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again as a driver.",
            variant: "destructive"
          });
          // Clear invalid token and redirect
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
          return;
        }
        
        if (profileResponse.status === 404) {
          toast({
            title: "Driver Profile Required",
            description: "Please complete your driver profile first before registering a vehicle.",
            variant: "destructive"
          });
          return;
        }
        
        if (!profileResponse.ok) {
          throw new Error(`Profile check failed with status: ${profileResponse.status}`);
        }
      } catch (profileError) {
        console.error('Profile check failed:', profileError);
        toast({
          title: "Connection Error", 
          description: "Unable to verify driver status. Please check your connection and try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file uploads
      if (!rcFile && !insuranceFile) {
        toast({
          title: "Documents Required",
          description: "Please upload at least one document (RC or Insurance).",
          variant: "destructive"
        });
        return;
      }
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('vehicleType', data.vehicleType);
      formData.append('vehicleNumber', data.vehicleNumber);
      formData.append('vehicleModel', data.vehicleModel);
      formData.append('yearOfManufacture', data.yearOfManufacture);
      formData.append('insuranceNumber', data.insuranceNumber);
      
      if (rcFile) {
        console.log('Adding RC file:', rcFile.name, 'Size:', rcFile.size, 'Type:', rcFile.type);
        formData.append('rcDocument', rcFile);
      }
      
      if (insuranceFile) {
        console.log('Adding Insurance file:', insuranceFile.name, 'Size:', insuranceFile.size, 'Type:', insuranceFile.type);
        formData.append('insuranceDocument', insuranceFile);
      }

      console.log('Submitting vehicle data:', {
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber,
        vehicleModel: data.vehicleModel,
        yearOfManufacture: data.yearOfManufacture,
        insuranceNumber: data.insuranceNumber,
        hasRcFile: !!rcFile,
        hasInsuranceFile: !!insuranceFile,
        rcFileName: rcFile?.name,
        insuranceFileName: insuranceFile?.name,
        rcFileSize: rcFile?.size,
        insuranceFileSize: insuranceFile?.size
      });

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Use the passed onAddVehicle function if available, otherwise fallback to direct API call
      if (onAddVehicle) {
        const response = await onAddVehicle(formData);
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Vehicle registered successfully and submitted for approval",
          });
          
          // Reset form and files
          vehicleOnboardingForm.reset();
          setRcFile(null);
          setInsuranceFile(null);
          
          // Clear file inputs
          const rcInput = document.getElementById('rc-upload') as HTMLInputElement;
          const insuranceInput = document.getElementById('insurance-upload') as HTMLInputElement;
          if (rcInput) rcInput.value = '';
          if (insuranceInput) insuranceInput.value = '';
        } else {
          throw new Error(response.message || 'Failed to register vehicle');
        }
      } else {
        // Fallback to direct API call
        const response = await vehicleApi.createVehicle(formData);
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Vehicle registered successfully and submitted for approval",
          });
          
          // Reset form and files
          vehicleOnboardingForm.reset();
          setRcFile(null);
          setInsuranceFile(null);
          
          // Clear file inputs
          const rcInput = document.getElementById('rc-upload') as HTMLInputElement;
          const insuranceInput = document.getElementById('insurance-upload') as HTMLInputElement;
          if (rcInput) rcInput.value = '';
          if (insuranceInput) insuranceInput.value = '';
          
          // Refresh vehicle list
          await onRefresh();
        } else {
          throw new Error(response.message || 'Failed to register vehicle');
        }
      }
    } catch (error: any) {
      console.error('Error registering vehicle:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
      
      let errorMessage = "Failed to register vehicle. Please try again.";
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
          errorMessage = "Authentication failed. Please log out and log back in as a driver.";
          // Clear the potentially invalid token
          localStorage.removeItem('authToken');
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          // Redirect to auth after a short delay
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
          return;
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = "Access denied. Please ensure you have driver privileges.";
        } else if (error.message.includes('404') || error.message.includes('profile not found')) {
          errorMessage = "Driver profile not found. Please complete your profile first.";
        } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = "Vehicle number already exists. Please check your vehicle number.";
        } else if (error.message.includes('Unable to connect') || error.message.includes('Failed to fetch')) {
          errorMessage = "Unable to connect to server. Please check your internet connection.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Management</CardTitle>
        <CardDescription>
          Register a new vehicle or manage your existing vehicles
        </CardDescription>
        
        {/* Authentication Status */}
        <div className="mt-4 p-3 rounded-lg border">
          {authStatus.isLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking authentication status...</span>
            </div>
          ) : authStatus.isAuthenticated ? (
            authStatus.hasProfile ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Ready to register vehicles - You are logged in as a driver with profile</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>Please complete your driver profile before registering vehicles</span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Please log in as a driver to register vehicles</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/auth'}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Your Current Vehicle</h3>
          {vehicles.length > 0 ? (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-medium">{vehicles[0].vehicleModel} ({vehicles[0].vehicleType})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{vehicles[0].vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year of Manufacture</p>
                  <p className="font-medium">{vehicles[0].yearOfManufacture}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Insurance Number</p>
                  <p className="font-medium">{vehicles[0].insuranceNumber}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-lg p-4 text-center">
              <p className="text-gray-500">No vehicle registered yet. Please register a vehicle below.</p>
            </div>
          )}
        </div>
        
        {/* Existing Vehicles */}
        {vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Vehicles</CardTitle>
              <CardDescription>
                Manage your registered vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {vehicle.vehicleType === 'BIKE' && <Bike className="h-5 w-5 text-blue-600" />}
                          {vehicle.vehicleType === 'CAR' && <Car className="h-5 w-5 text-blue-600" />}
                          {vehicle.vehicleType === 'TRUCK' && <Truck className="h-5 w-5 text-blue-600" />}
                          <span className="font-semibold">{vehicle.vehicleType}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={vehicle.isActive ? "default" : "secondary"}>
                            {vehicle.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={vehicle.isVerified ? "default" : "destructive"}>
                            {vehicle.isVerified ? "Verified" : "Pending Verification"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><strong>Number:</strong> {vehicle.vehicleNumber}</div>
                        <div><strong>Model:</strong> {vehicle.vehicleModel}</div>
                        <div><strong>Year:</strong> {vehicle.yearOfManufacture}</div>
                        <div><strong>Insurance:</strong> {vehicle.insuranceNumber}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Register New Vehicle</h3>
          
          {!authStatus.isAuthenticated || !authStatus.hasProfile ? (
            <div className="bg-gray-50 border rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {!authStatus.isAuthenticated 
                  ? "Please log in as a driver to register vehicles" 
                  : "Please complete your driver profile to register vehicles"
                }
              </p>
              {!authStatus.isAuthenticated && (
                <Button onClick={() => window.location.href = '/auth'}>
                  Go to Login Page
                </Button>
              )}
            </div>
          ) : (
            <Form {...vehicleOnboardingForm}>
            <form onSubmit={vehicleOnboardingForm.handleSubmit(onVehicleOnboardingSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={vehicleOnboardingForm.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg backdrop-blur-none opacity-100 z-50">
                          <SelectItem value="BIKE">Bike</SelectItem>
                          <SelectItem value="AUTO">Auto Rickshaw</SelectItem>
                          <SelectItem value="CAR">Car</SelectItem>
                          <SelectItem value="TRUCK">Truck</SelectItem>
                          <SelectItem value="VAN">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleOnboardingForm.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="KA-01-XX-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleOnboardingForm.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Honda Activa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleOnboardingForm.control}
                  name="yearOfManufacture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Manufacture</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2021" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={vehicleOnboardingForm.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., INS123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel>Upload Documents</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload Vehicle RC
                    </p>
                    {rcFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {rcFile.name}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      id="rc-upload" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "File Too Large",
                              description: "Please select a file smaller than 5MB.",
                              variant: "destructive"
                            });
                            e.target.value = ''; // Clear the input
                            return;
                          }
                          
                          // Validate file type
                          const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                          if (!validTypes.includes(file.type)) {
                            toast({
                              title: "Invalid File Type",
                              description: "Please select a PDF, JPG, or PNG file.",
                              variant: "destructive"
                            });
                            e.target.value = ''; // Clear the input
                            return;
                          }
                          
                          console.log('RC file selected:', file.name, file.type, file.size);
                          setRcFile(file);
                          toast({
                            title: "File Selected",
                            description: `RC document "${file.name}" selected successfully.`,
                          });
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => document.getElementById('rc-upload')?.click()}
                    >
                      Choose RC File
                    </Button>
                  </div>
                  <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload Insurance
                    </p>
                    {insuranceFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {insuranceFile.name}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      id="insurance-upload" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "File Too Large",
                              description: "Please select a file smaller than 5MB.",
                              variant: "destructive"
                            });
                            e.target.value = ''; // Clear the input
                            return;
                          }
                          
                          // Validate file type
                          const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                          if (!validTypes.includes(file.type)) {
                            toast({
                              title: "Invalid File Type",
                              description: "Please select a PDF, JPG, or PNG file.",
                              variant: "destructive"
                            });
                            e.target.value = ''; // Clear the input
                            return;
                          }
                          
                          console.log('Insurance file selected:', file.name, file.type, file.size);
                          setInsuranceFile(file);
                          toast({
                            title: "File Selected",
                            description: `Insurance document "${file.name}" selected successfully.`,
                          });
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => document.getElementById('insurance-upload')?.click()}
                    >
                      Choose Insurance File
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <File className="mr-2 h-4 w-4" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </form>
          </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
