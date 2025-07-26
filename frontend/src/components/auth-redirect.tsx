import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

interface AuthRedirectProps {
  children: React.ReactNode;
  requiredRole?: 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';
  redirectTo?: string;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('[AuthRedirect] User not authenticated, redirecting to:', redirectTo);
        router.replace(redirectTo);
      } else if (requiredRole && user && user.role !== requiredRole) {
        console.log('[AuthRedirect] User role mismatch. Required:', requiredRole, 'User:', user.role);
        // Redirect based on actual role
        if (user.role === 'DRIVER') {
          router.replace('/driver');
        } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Show loading screen while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

// Hook for handling auth redirects after login
export const useAuthRedirect = () => {
  const router = useRouter();
  
  const redirectAfterLogin = (userRole: string, isDriverCheckbox: boolean = false) => {
    console.log('[AuthRedirect] Redirecting after login:', { userRole, isDriverCheckbox });
    
    if (isDriverCheckbox || userRole === 'DRIVER') {
      console.log('[AuthRedirect] Redirecting to driver panel');
      router.replace('/driver');
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      console.log('[AuthRedirect] Redirecting to admin panel');  
      router.replace('/admin');
    } else {
      console.log('[AuthRedirect] Redirecting to home');
      router.replace('/');
    }
  };

  return { redirectAfterLogin };
};
