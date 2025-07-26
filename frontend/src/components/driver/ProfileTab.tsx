
import React from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, MapPin, Calendar, Upload, Edit, Save } from 'lucide-react';

// Define validation schema for driver profile
const driverProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be 12 digits").max(12, "Aadhaar number must be 12 digits").regex(/^\d+$/, "Aadhaar number must contain only digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6, "Pincode must be 6 digits"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactNumber: z.string().min(10, "Emergency contact number must be at least 10 digits"),
  licenseNumber: z.string().min(1, "License number is required"),
  experienceYears: z.string().min(1, "Experience is required"),
  languagesSpoken: z.string().optional(),
});

export interface DriverProfile {
  id: string;
  userId: string;
  aadhaarNumber: string;
  licenseNumber: string;
  experienceYears: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  languagesSpoken?: string;
  isOnline: boolean;
  isVerified: boolean;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
    dateOfBirth?: string;
  };
}

interface ProfileTabProps {
  driverProfile: DriverProfile | null;
  isLoading: boolean;
  onUpdateProfile: (data: any) => Promise<void>;
}

export const ProfileTab = ({ driverProfile, isLoading, onUpdateProfile }: ProfileTabProps) => {
  const { toast } = useToast();

  // Driver profile form
  const driverProfileForm = useForm({
    resolver: zodResolver(driverProfileSchema),
    defaultValues: {
      fullName: driverProfile?.user?.fullName || "",
      email: driverProfile?.user?.email || "",
      phoneNumber: driverProfile?.user?.phoneNumber || "",
      dateOfBirth: driverProfile?.user?.dateOfBirth || "",
      aadhaarNumber: driverProfile?.aadhaarNumber || "",
      address: driverProfile?.address || "",
      city: driverProfile?.city || "",
      state: driverProfile?.state || "",
      pincode: driverProfile?.pincode || "",
      emergencyContactName: driverProfile?.emergencyContactName || "",
      emergencyContactNumber: driverProfile?.emergencyContactNumber || "",
      licenseNumber: driverProfile?.licenseNumber || "",
      experienceYears: driverProfile?.experienceYears?.toString() || "",
      languagesSpoken: driverProfile?.languagesSpoken || "",
    },
  });

  // Handle profile update submission
  const onProfileUpdateSubmit = async (data: z.infer<typeof driverProfileSchema>) => {
    try {
      await onUpdateProfile(data);
      toast({
        title: "Profile Updated Successfully! 🎉",
        description: "Your personal information has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-100">
          <CardContent className="p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-20 w-20 bg-blue-200 rounded-full mb-4"></div>
              <div className="h-6 bg-blue-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-blue-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header Card */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-100">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Driver Profile" />
                <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                  RK
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white text-blue-600 hover:bg-gray-50 border border-blue-200"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {driverProfileForm.watch('fullName')}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 w-fit mx-auto sm:mx-0">
                  Active Driver
                </Badge>
                
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-600">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{driverProfileForm.watch('email')}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{driverProfileForm.watch('phoneNumber')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <User className="h-5 w-5 text-blue-600" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...driverProfileForm}>
            <form onSubmit={driverProfileForm.handleSubmit(onProfileUpdateSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input placeholder="Enter your full name" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input type="date" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input type="email" placeholder="your.email@example.com" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input placeholder="9876543210" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Aadhaar Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input placeholder="123456789012" className="pl-10 h-11" maxLength={12} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Address Information</h3>
                
                <FormField
                  control={driverProfileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                          </div>
                          <Textarea 
                            placeholder="Enter your complete address"
                            className="pl-10 min-h-[80px] resize-none"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter City" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='bg-white'>
                            <SelectItem value="Bihar">Bihar</SelectItem>

                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Pincode" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Contact Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input placeholder="Emergency contact name" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Contact Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input placeholder="9876543211" className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={driverProfileForm.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Driving License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="KA0220220001234" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverProfileForm.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Driving Experience (Years)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6-10 Years</SelectItem>
                            <SelectItem value="10">10+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={driverProfileForm.control}
                  name="languagesSpoken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Languages Spoken</FormLabel>
                      <FormControl>
                        <Input 
                           
                          className="h-11" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto text-white bg-blue-600 hover:bg-blue-700 h-11 px-8"
                  size="lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-3">
                  All information provided will be kept confidential and used only for service delivery purposes.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};