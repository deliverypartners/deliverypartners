import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MapPin, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Area {
  id: string;
  name: string;
  isActive: boolean;
  cityId: string;
}

interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  areas: Area[];
}

interface CitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCitySelect: (city: City, area?: Area) => void;
  selectedCity?: string;
}

const CitySelectionModal: React.FC<CitySelectionModalProps> = ({
  isOpen,
  onClose,
  onCitySelect,
  selectedCity
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityData, setSelectedCityData] = useState<City | null>(null);
  const [showAreas, setShowAreas] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActiveCities();
    }
  }, [isOpen]);

  const fetchActiveCities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/cities/active`);
      const data = await response.json();
      
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCityClick = (city: City) => {
    if (city.areas && city.areas.length > 0) {
      setSelectedCityData(city);
      setShowAreas(true);
    } else {
      onCitySelect(city);
      onClose();
    }
  };

  const handleAreaSelect = (area: Area) => {
    if (selectedCityData) {
      onCitySelect(selectedCityData, area);
      onClose();
    }
  };

  const handleBack = () => {
    setShowAreas(false);
    setSelectedCityData(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showAreas && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="p-1 h-8 w-8"
              >
                ←
              </Button>
            )}
            <MapPin className="h-5 w-5 text-blue-600" />
            {showAreas ? `Areas in ${selectedCityData?.name}` : 'Select Your City'}
          </DialogTitle>
          <DialogDescription>
            {showAreas 
              ? 'Choose your area for accurate delivery estimates'
              : 'We deliver to these cities across India'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAreas && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cities or states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading cities...</p>
              </div>
            ) : showAreas ? (
              selectedCityData?.areas.map((area) => (
                <div
                  key={area.id}
                  onClick={() => handleAreaSelect(area)}
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{area.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Available
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              filteredCities.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{city.name}</h3>
                      <p className="text-sm text-gray-500">{city.state}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {city.areas && city.areas.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {city.areas.length} areas
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}

            {!loading && !showAreas && filteredCities.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No cities found</p>
                <p className="text-sm text-gray-400">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CitySelectionModal;
