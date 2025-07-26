'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, Calendar } from "lucide-react";

import { BikeRateCards } from "./ratecards/TwoWheelerRateCards";
import { TruckRateCards } from "./ratecards/TruckRateCards";
import { PackersMoversCards } from "./ratecards/pmCards";

// Props to control what to show
interface AppUIProps {
  show?: 'bike' | 'truck' | 'pm' | 'both';
}

export default function AppUI({ show = 'both' }: AppUIProps) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set default to current date and time
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  });
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  
  const originRef = useRef<HTMLInputElement>(null!);
  const destRef = useRef<HTMLInputElement>(null!);

  // Truck options based on the rate cards
  const truckOptions = [
    { value: '3_wheeler', label: '3 Wheeler', dimensions: '5\'×3\'×3\'', capacity: '500 kg' },
    { value: 'tata_ace', label: 'Tata Ace', dimensions: '7\'×4.5\'×4\'', capacity: '900 kg' },
    { value: 'bolero_pickup', label: 'Bolero Pickup', dimensions: '8\'×5\'×4.5\'', capacity: '1700 kg' },
    { value: 'tata_709_lpt', label: 'Tata 709 LPT', dimensions: '12\'×6\'×6\'', capacity: '6000 kg' },
    { value: 'tata_lpt_1109', label: 'Tata LPT 1109', dimensions: '14\'×7\'×7\'', capacity: '8000 kg' }
  ];

  const handleGetEstimate = async () => {
    const pickupValue = originRef.current?.value || '';
    const dropValue = destRef.current?.value || '';
    
    if (!pickupValue || !dropValue) {
      alert('Please enter both pickup and drop locations');
      return;
    }
    
    // Get form values
    const phoneNumber = document.querySelector<HTMLInputElement>('input[placeholder="Phone Number"]')?.value || '';
    const customerName = document.querySelector<HTMLInputElement>('input[placeholder="Name"]')?.value || '';
    const customerType = document.querySelector<HTMLSelectElement>('select')?.value || '';
    
    if (!phoneNumber || !customerName || !customerType) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate truck selection for truck service
    if (show === 'truck' && !selectedTruck) {
      alert('Please select a truck type');
      return;
    }

    // Validate pickup date
    if (!selectedDate) {
      alert('Please select a pickup date');
      return;
    }

    const pickupDate = new Date(selectedDate);
    const now = new Date();
    
    // Check if selected date is in the past
    if (pickupDate < now) {
      alert('Pickup date cannot be in the past');
      return;
    }

    try {
      // Check if user is authenticated for all bookings
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please log in to create a booking');
        router.push('/auth');
        return;
      }

      // Create booking via API for all service types
      const selectedTruckInfo = show === 'truck' && selectedTruck ? 
        truckOptions.find(truck => truck.value === selectedTruck) : null;
      
      // Determine service type based on selection
      const getServiceType = (show: string) => {
        switch (show) {
          case 'bike': return 'BIKE_DELIVERY';
          case 'truck': return 'TRUCK_DELIVERY';
          case 'pm': return 'PACKERS_MOVERS';
          default: return 'BIKE_DELIVERY';
        }
      };
      
      // Get estimated fare based on service type
      const getEstimatedFare = (show: string, selectedTruckInfo: any) => {
        if (show === 'truck' && selectedTruckInfo) {
          // Set estimated fares based on truck type since we no longer have price property
          const truckFares = {
            '3_wheeler': 800,
            'tata_ace': 1000,
            'bolero_pickup': 1400,
            'tata_709_lpt': 4000,
            'tata_lpt_1109': 4800
          };
          return truckFares[selectedTruckInfo.value as keyof typeof truckFares] || 1000;
        } else if (show === 'pm') {
          return 5000; // Base fare for packers and movers
        }
        return 100; // Base fare for bike delivery
      };
      
      // Get vehicle information
      const getVehicleInfo = (show: string, selectedTruckInfo: any) => {
        if (show === 'truck' && selectedTruckInfo) {
          return {
            vehicleType: selectedTruck,
            vehicleName: selectedTruckInfo.label
          };
        } else if (show === 'bike') {
          return {
            vehicleType: 'bike',
            vehicleName: '2 Wheeler'
          };
        } else if (show === 'pm') {
          return {
            vehicleType: 'packers_movers',
            vehicleName: 'Packers & Movers Service'
          };
        }
        return { vehicleType: 'bike', vehicleName: '2 Wheeler' };
      };
      
      const vehicleInfo = getVehicleInfo(show, selectedTruckInfo);
      
      const bookingData = {
        serviceType: getServiceType(show),
        pickupAddress: pickupValue,
        pickupLatitude: 0, // You might want to get actual coordinates
        pickupLongitude: 0,
        dropoffAddress: dropValue,
        dropoffLatitude: 0,
        dropoffLongitude: 0,
        pickupDateTime: new Date(selectedDate).toISOString(),
        estimatedFare: getEstimatedFare(show, selectedTruckInfo),
        notes: `Customer: ${customerName}, Phone: ${phoneNumber}, Type: ${customerType}${selectedTruckInfo ? `, Vehicle: ${selectedTruckInfo.label}` : ''}`,
        paymentMethod: 'CASH',
        customerName,
        customerPhone: phoneNumber,
        customerType,
        vehicleType: vehicleInfo.vehicleType,
        vehicleName: vehicleInfo.vehicleName
      };
      
      // Make API call to create booking
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        const bookingId = result.data.id;
        
        // Handle different redirect logic based on service type
        if (show === 'pm') {
          // For Packers & Movers, redirect to customer care confirmation
          const params = new URLSearchParams({
            name: customerName,
            phone: phoneNumber,
            pickup: pickupValue,
            drop: dropValue,
            pickupDate: selectedDate,
            serviceType: show,
            customerType: customerType,
            bookingId: bookingId // Include booking ID for reference
          });
          
          router.push(`/customer-care-confirmation?${params.toString()}`);
        } else {
          // For bike and truck services, redirect to ride status
          const params = new URLSearchParams({
            bookingId: bookingId,
            pickup: pickupValue,
            drop: dropValue,
            type: show,
            pickupDate: selectedDate
          });
          
          // Add vehicle information for truck bookings
          if (show === 'truck' && selectedTruckInfo) {
            params.append('vehicleName', selectedTruckInfo.label);
            params.append('vehicleType', selectedTruck);
            params.append('vehicleDimensions', selectedTruckInfo.dimensions);
            params.append('vehicleCapacity', selectedTruckInfo.capacity);
          }
          
          // Redirect to ride status page with booking ID and vehicle details
          router.push(`/ride-status?${params.toString()}`);
        }
      } else {
        // Get error details from response
        const errorData = await response.json();
        console.error('Booking creation failed:', errorData);
        alert(`Failed to create booking: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      alert('An error occurred while creating your booking. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      

      {/* Hero Section with background */}
      <div
        className="relative w-full h-[320px] md:h-[380px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://ik.imagekit.io/vf1wtj1uk/deliverypartners/3d-rendering-buddha-statue-cave.jpg?updatedAt=1748935408872')"
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black/45" />
        <div className="relative z-10 text-center text-white">
          <div className="text-2xl md:text-3xl font-bold mb-2">
            {show === 'pm' ? 'Professional Packers & Movers Services' : 
             'Reliable Goods Transportation Services'}
          </div>
        </div>

        {/* Floating Card */}
        <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-2 md:px-8 py-8 w-[95vw] md:w-[1000px] z-20">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <div className="flex-2">
              <input 
                ref={originRef}
                type="text" 
                placeholder="Pickup Address" 
                className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
             
            </div>
            <div className="flex-2">
              <input 
                ref={destRef}
                type="text" 
                placeholder="Drop Address" 
                className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
              
            </div>
            <div className="flex-2">
              <input type="text" placeholder="Phone Number" className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex-2 relative">
              <input 
                type="datetime-local" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="px-2 py-1 border border-gray-300 text-gray-500 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Select pickup date and time"
                placeholder="Pickup Date & Time"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Truck Selection Dropdown - Only show for truck service */}
            {show === 'truck' && (
              <div className="flex-2">
                <select 
                  value={selectedTruck}
                  onChange={(e) => setSelectedTruck(e.target.value)}
                  className="px-2 py-1 border border-gray-300 text-gray-500 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  required
                >
                  <option value="">Select Truck Type *</option>
                  {truckOptions.map((truck) => (
                    <option key={truck.value} value={truck.value}>
                      {truck.label} - {truck.capacity}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex-1">
              <input type="text" placeholder="Name" className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex-1">
              <select className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-500 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer">
                <option>What describes you best? *</option>
                <option>Business</option>
                <option>Individual</option>
              </select>
            </div>
            <button 
              onClick={handleGetEstimate}
              className="bg-blue-600 text-white px-6 py-2 font-bold font-md rounded-2xl cursor-pointer inline-flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-32 px-4">
        {show === 'bike' && <BikeRateCards />}
        {show === 'truck' && <TruckRateCards />}
        {show === 'pm' && <PackersMoversCards />}
        {show === 'both' && (
          <>
            <BikeRateCards />
            <TruckRateCards />
            <PackersMoversCards />
          </>
        )}
      </div>

    </div>
  );
}