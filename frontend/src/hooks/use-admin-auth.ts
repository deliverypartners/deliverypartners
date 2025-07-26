'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminAuthData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Don't check auth on login page
        if (pathname === '/admin/login') {
          setIsLoading(false);
          return;
        }

        const adminToken = localStorage.getItem('adminToken');
        const authToken = localStorage.getItem('authToken');

        if (!adminToken && !authToken) {
          throw new Error('No authentication token found');
        }

        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken || authToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`);
        }

        const result = await response.json();
        
        // Check if user has admin role
        if (!result.data || !['ADMIN', 'SUPER_ADMIN'].includes(result.data.role)) {
          throw new Error('Insufficient permissions - Admin role required');
        }

        setIsAuthenticated(true);
        setAdminData(result.data);
      } catch (error) {
        console.error('Admin authentication check failed:', error);
        
        // Clear all authentication data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        setIsAuthenticated(false);
        setAdminData(null);
        
        // Force redirect to login
        if (pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();

    // Re-check authentication when the pathname changes
  }, [pathname]);

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    setAdminData(null);
    
    // Redirect to login
    window.location.href = '/admin/login';
  };

  return {
    isAuthenticated,
    isLoading,
    adminData,
    logout
  };
}
