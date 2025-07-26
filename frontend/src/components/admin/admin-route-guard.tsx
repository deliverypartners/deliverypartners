'use client';

import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminRouteGuard({ children, fallback }: AdminRouteGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    // Additional security: prevent developer tools access
    const preventDevTools = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        console.clear();
        return false;
      }
    };

    // Disable right-click context menu
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', preventDevTools);
    document.addEventListener('contextmenu', preventRightClick);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', preventDevTools);
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, []);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Securing admin access...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    // Force redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="text-gray-600 mt-2">Redirecting to secure login...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
