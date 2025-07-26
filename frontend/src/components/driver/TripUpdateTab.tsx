
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation, Loader2, RefreshCw } from 'lucide-react';
import { Trip } from './ActiveTripsTab';

// Define validation schema for location update
const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// Define the type for form data
type LocationUpdateFormData = z.infer<typeof locationUpdateSchema>;

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
}

interface TripUpdateTabProps {
  activeTrips: Trip[];
  onUpdateLocation: (bookingId: string, latitude: number, longitude: number) => Promise<void>;
}

export const TripUpdateTab = ({ activeTrips, onUpdateLocation }: TripUpdateTabProps) => {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // Location update form
  const locationForm = useForm<LocationUpdateFormData>({
    resolver: zodResolver(locationUpdateSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Get current GPS location
  const getCurrentLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Driver location coordinates:', { latitude, longitude });
          
          // Get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          console.log('Location data:', data);
          
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          const locationData: LocationData = {
            latitude,
            longitude,
            address,
            timestamp: new Date(),
          };
          
          setCurrentLocation(locationData);
          
          // Update form with location data
          locationForm.setValue('latitude', latitude);
          locationForm.setValue('longitude', longitude);
          locationForm.setValue('address', address);
          
          toast({
            title: "Location updated",
            description: "Your current location has been captured successfully.",
          });
        } catch (error) {
          console.error('Location fetch error:', error);
          toast({
            title: "Error fetching location details",
            description: "Failed to get address information. Using coordinates only.",
            variant: "destructive",
          });
          
          // Still set coordinates even if address fetch fails
          const { latitude, longitude } = position.coords;
          const locationData: LocationData = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(),
          };
          
          setCurrentLocation(locationData);
          locationForm.setValue('latitude', latitude);
          locationForm.setValue('longitude', longitude);
          locationForm.setValue('address', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        let errorMessage = "Could not access your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown location error occurred.";
        }
        
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle location update submission
  const onLocationUpdateSubmit = async (data: LocationUpdateFormData) => {
    console.log("Location Update Data:", data);
    
    if (!currentLocation) {
      toast({
        title: "No location data",
        description: "Please capture your location first.",
        variant: "destructive",
      });
      return;
    }

    // Update location for all active trips
    try {
      const activeTripsInProgress = activeTrips.filter(trip => 
        trip.status === 'IN_PROGRESS' || trip.status === 'STARTED'
      );

      if (activeTripsInProgress.length === 0) {
        toast({
          title: "No active trips",
          description: "You don't have any active trips to update location for.",
          variant: "destructive",
        });
        return;
      }

      // Update location for each active trip
      for (const trip of activeTripsInProgress) {
        await onUpdateLocation(trip.bookingId, data.latitude, data.longitude);
      }
    
      toast({
        title: "Location Updated",
        description: `Your location has been updated for ${activeTripsInProgress.length} active trip(s)`,
      });
    
      // Reset only the notes field, keep location data
      locationForm.setValue('notes', '');
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Location Update</CardTitle>
          <CardDescription className="text-sm">
            Update your current location for real-time tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">Current Location</h4>
                  <p className="text-xs sm:text-sm text-blue-700 mb-2 break-words">{currentLocation.address}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs text-blue-600">
                    <div className="truncate">
                      <span className="font-medium">Lat:</span> {currentLocation.latitude.toFixed(6)}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Lng:</span> {currentLocation.longitude.toFixed(6)}
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-xs">
                      <span className="font-medium">Updated:</span> {currentLocation.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Capture Buttons */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <Button 
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="w-full h-12 sm:h-auto"
              size="lg"
            >
              {isLocating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  {currentLocation ? 'Update Location' : 'Get Current Location'}
                </>
              )}
            </Button>
            
            {currentLocation && (
              <Button 
                variant="outline" 
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="w-full h-10 sm:h-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Location
              </Button>
            )}
          </div>

          {/* Location Update Form */}
          {currentLocation && (
            <Form {...locationForm}>
              <form onSubmit={locationForm.handleSubmit(onLocationUpdateSubmit)} className="space-y-4">
                <FormField
                  control={locationForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about your current location or status" 
                          className="min-h-[80px] sm:min-h-[100px] text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-11 sm:h-auto">
                  <MapPin className="mr-2 h-4 w-4" />
                  Update Location in System
                </Button>
              </form>
            </Form>
          )}

          {/* Location Permission Help */}
          {!currentLocation && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Need Help with Location Access?</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Make sure location services are enabled on your device</li>
                <li>• Allow location access when prompted by your browser</li>
                <li>• If blocked, click the location icon in your address bar to enable</li>
                <li>• For best accuracy, ensure you're outdoors with clear sky view</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
