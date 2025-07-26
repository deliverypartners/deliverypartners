"use client";

import { useAuth } from '@/hooks/use-auth';
import { tokenManager } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuthDebug = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const token = tokenManager.getToken();
  const userData = tokenManager.getUserData();

  if (isLoading) {
    return <div>Loading auth debug...</div>;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Authenticated:</span>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">Has Token:</span>
            <Badge variant={token ? "default" : "destructive"}>
              {token ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">User Role:</span>
            <Badge variant={user?.role === 'DRIVER' ? "default" : "secondary"}>
              {user?.role || 'Not set'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">User ID:</span>
            <span className="text-sm text-gray-600">{user?.userId || 'Not set'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span className="text-sm text-gray-600">{user?.email || 'Not set'}</span>
          </div>
          
          {token && (
            <div className="mt-4">
              <span className="font-semibold">Token (first 50 chars):</span>
              <div className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded">
                {token.substring(0, 50)}...
              </div>
            </div>
          )}
          
          {userData && (
            <div className="mt-4">
              <span className="font-semibold">Decoded Token Data:</span>
              <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Test API call */}
          <div className="mt-4">
            <span className="font-semibold">API Test:</span>
            <div className="space-y-2 mt-2">
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/drivers/profile`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    const data = await response.text();
                    console.log('Driver Profile API Test:', {
                      status: response.status,
                      statusText: response.statusText,
                      data: data
                    });
                  } catch (error) {
                    console.error('Driver Profile API Test Error:', error);
                  }
                }}
                className="block w-full px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Test Driver Profile API
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/vehicles/my-vehicles`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    const data = await response.text();
                    console.log('My Vehicles API Test:', {
                      status: response.status,
                      statusText: response.statusText,
                      data: data
                    });
                  } catch (error) {
                    console.error('My Vehicles API Test Error:', error);
                  }
                }}
                className="block w-full px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Test My Vehicles API
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const formData = new FormData();
                    formData.append('vehicleType', 'BIKE');
                    formData.append('vehicleNumber', 'TEST1234');
                    formData.append('vehicleModel', 'Test Model');
                    formData.append('yearOfManufacture', '2023');
                    formData.append('insuranceNumber', 'TEST123');
                    
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_URL}/vehicles`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: formData
                    });
                    const data = await response.text();
                    console.log('Create Vehicle API Test:', {
                      status: response.status,
                      statusText: response.statusText,
                      data: data
                    });
                  } catch (error) {
                    console.error('Create Vehicle API Test Error:', error);
                  }
                }}
                className="block w-full px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Test Create Vehicle API
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
