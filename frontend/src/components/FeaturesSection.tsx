"use client";

import { useState } from 'react';
import { Truck, Bike, Package, User, MapPin, ChevronDown, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CitySelectionModal from './CitySelectionModal';

interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  areas: Area[];
}

interface Area {
  id: string;
  name: string;
  isActive: boolean;
  cityId: string;
}

const FeaturesSection = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Select Your City');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCitySelect = (city: City, area?: Area) => {
    if (area) {
      setSelectedCity(`${city.name}, ${area.name}`);
      setSelectedArea(area.name);
    } else {
      setSelectedCity(city.name);
      setSelectedArea('');
    }
    toast({
      title: "City Selected",
      description: `Services available in ${area ? `${city.name}, ${area.name}` : city.name}`,
    });
  };

  const services = [
    {
      title: "Truck",
      icon: Truck,
      link: "estimate/trucks"
    },
    {
      title: "Two Wheeler",
      icon: Bike,
      link: "estimate/two-wheelers"
    },
    {
      title: "Packers & Movers",
      icon: Package,
      link: "estimate/packers-movers"
    }
  ];

  const estimateServices = [
    {
      title: "Two Wheelers",
      icon: "🏍️",
      description: "Quick deliveries with bikes",
      link: "/estimate/two-wheelers"
    },
    {
      title: "Trucks",
      icon: "🚛",
      description: "Heavy goods transportation",
      link: "/estimate/trucks"
    },
    {
      title: "Packers & Movers",
      icon: "📦",
      description: "Complete relocation services",
      link: "/estimate/packers-movers"
    }
  ];

  const handleEstimateClick = (service: any) => {
    setIsEstimateModalOpen(false);
    // Navigate to the service page
    window.location.href = service.link;
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 py-16 flex items-center justify-center">
      {/* Background overlay with delivery person and vehicles */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-1000 opacity-20"></div>
      
      {/* Left side text */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white z-10">
        <h1 className="text-4xl font-bold mb-2">Delivery hai?</h1>
        <h2 className="text-3xl font-bold">#Done Samjho</h2>
      </div>

      {/* Center card */}
      <div className="relative z-20 bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full">
        {/* City selector */}
        <button 
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center w-full mb-6 pb-4 border-b border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
        >
          <MapPin className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-gray-700 font-medium flex-1 text-left">
            City: {selectedCity}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
        </button>

        {/* Services grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <button
                key={index}
                onClick={() => window.location.href = service.link}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700 text-center font-medium leading-tight">
                  {service.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Get an Estimate button */}
        <Button 
          onClick={() => setIsEstimateModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg"
        >
          Get an Estimate
        </Button>
      </div>

      {/* Estimate Modal */}
      <Dialog open={isEstimateModalOpen} onOpenChange={setIsEstimateModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Get an Estimate</DialogTitle>
          </DialogHeader>
          <div className="flex">
            {/* Left Side - Get an Estimate */}
            <div className="bg-gray-100 p-8 w-1/3 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Get an Estimate</h2>
              <p className="text-gray-600 leading-relaxed">
                Please fill in the details, so we can provide you with the best of our services
              </p>
            </div>
            
            {/* Right Side - Service Options */}
            <div className="flex-1 p-8">
              <div className="space-y-4">
                {estimateServices.map((service, index) => (
                  <button
                    key={index}
                    onClick={() => handleEstimateClick(service)}
                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{service.icon}</span>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                          {service.title}
                        </h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* City Selection Modal */}
      <CitySelectionModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
      />
    </div>
  );
};

export default FeaturesSection;
