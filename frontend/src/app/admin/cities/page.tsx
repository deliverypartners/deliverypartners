'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Trash2, MapPin, Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  _count: {
    areas: number;
  };
  createdAt: string;
  updatedAt: string;
}

const CityManagement = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [isEditCityOpen, setIsEditCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [newCity, setNewCity] = useState({
    name: '',
    state: '',
    isActive: true,
    areas: [] as { name: string; isActive: boolean }[]
  });
  const [newArea, setNewArea] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // const response = await fetch('http://localhost:5000/api/cities', {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.name.trim() || !newCity.state.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCity)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "City added successfully",
        });
        setIsAddCityOpen(false);
        setNewCity({
          name: '',
          state: '',
          isActive: true,
          areas: []
        });
        fetchCities();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding city:', error);
      toast({
        title: "Error",
        description: "Failed to add city",
        variant: "destructive",
      });
    }
  };

  const handleToggleCityStatus = async (city: City) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/cities/${city.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        fetchCities();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling city status:', error);
      toast({
        title: "Error",
        description: "Failed to update city status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm('Are you sure you want to delete this city? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/cities/${cityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "City deleted successfully",
        });
        fetchCities();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({
        title: "Error",
        description: "Failed to delete city",
        variant: "destructive",
      });
    }
  };

  const handleAddArea = () => {
    if (!newArea.trim()) return;

    setNewCity(prev => ({
      ...prev,
      areas: [...prev.areas, { name: newArea.trim(), isActive: true }]
    }));
    setNewArea('');
  };

  const handleRemoveArea = (index: number) => {
    setNewCity(prev => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">City Management</h1>
          <p className="text-gray-600">Manage cities and areas where your service is available</p>
        </div>
        <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New City</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cityName">City Name</Label>
                <Input
                  id="cityName"
                  placeholder="Enter city name"
                  value={newCity.name}
                  onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="stateName">State</Label>
                <Input
                  id="stateName"
                  placeholder="Enter state name"
                  value={newCity.state}
                  onChange={(e) => setNewCity(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Switch
                  id="isActive"
                  checked={newCity.isActive}
                  onCheckedChange={(checked) => setNewCity(prev => ({ ...prev, isActive: checked }))}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                />
                <div className="flex flex-col">
                  <Label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                    {newCity.isActive ? 'Active' : 'Inactive'}
                  </Label>
                  <span className="text-xs text-gray-500">
                    {newCity.isActive ? 'City will be visible to users' : 'City will be hidden from users'}
                  </span>
                </div>
              </div>
              
              {/* Areas Section */}
              <div>
                <Label>Areas (Optional)</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Enter area name"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
                  />
                  <Button type="button" onClick={handleAddArea} size="sm">
                    Add
                  </Button>
                </div>
                {newCity.areas.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {newCity.areas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{area.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveArea(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddCityOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCity}>
                  Add City
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.filter(c => c.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Areas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.reduce((sum, city) => sum + city._count.areas, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cities</CardTitle>
          <CardDescription>
            Manage all cities and their availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading cities...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Areas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.state}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {city._count.areas} areas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={city.isActive ? "default" : "secondary"}>
                        {city.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(city.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCityStatus(city)}
                        >
                          {city.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCity(city.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CityManagement;
