'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
  fallbackMode?: boolean;
  onLocationSelect?: (location: { address: string; lat?: number; lng?: number }) => void;
}

export default function LocationInput({ 
  placeholder, 
  inputRef, 
  fallbackMode = false,
  onLocationSelect 
}: LocationInputProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Only initialize Google Places Autocomplete if not in fallback mode and Google Maps is loaded
    if (!fallbackMode && typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places && inputRef.current) {
      try {
        // Initialize the autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'IN' }, // Restrict to India
          fields: ['formatted_address', 'geometry.location', 'name', 'place_id']
        });

        // Add listener for place selection
        const listener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            const location = {
              address: place.formatted_address,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng()
            };
            
            // Call the callback if provided
            if (onLocationSelect) {
              onLocationSelect(location);
            }
          }
        });

        // Cleanup function
        return () => {
          if (listener && window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }
  }, [fallbackMode, inputRef, onLocationSelect]);

  // Handle manual location detection
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          if (!fallbackMode && window.google && window.google.maps && window.google.maps.Geocoder) {
            // Use Google Geocoder if available
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results && results[0] && inputRef.current) {
                  const address = results[0].formatted_address;
                  inputRef.current.value = address;
                  
                  if (onLocationSelect) {
                    onLocationSelect({
                      address,
                      lat: latitude,
                      lng: longitude
                    });
                  }
                } else {
                  console.error('Geocoding failed:', status);
                  // Fallback to coordinates
                  if (inputRef.current) {
                    const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    inputRef.current.value = coordsAddress;
                    
                    if (onLocationSelect) {
                      onLocationSelect({
                        address: coordsAddress,
                        lat: latitude,
                        lng: longitude
                      });
                    }
                  }
                }
              }
            );
          } else {
            // Fallback mode - just use coordinates
            if (inputRef.current) {
              const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              inputRef.current.value = coordsAddress;
              
              if (onLocationSelect) {
                onLocationSelect({
                  address: coordsAddress,
                  lat: latitude,
                  lng: longitude
                });
              }
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Could not get your location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          
          alert(errorMessage + ' Please enter address manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please enter address manually.');
    }
  };

  if (fallbackMode) {
    // Fallback mode - regular input with location button
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="px-2 py-1 pr-8 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Get current location"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Normal mode with Google Places Autocomplete
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="px-2 py-1 pr-8 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
        title="Get current location"
      >
        <MapPin className="w-4 h-4" />
      </button>
    </div>
  );
}