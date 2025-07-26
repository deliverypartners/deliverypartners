"use client";

import { useState, useEffect } from 'react';
import { tokenManager, authApi } from '@/lib/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated();
      const userData = tokenManager.getUserData();
      console.log('[useAuth] Auth state check:', { authenticated, hasToken: !!tokenManager.getToken(), userData });
      setIsAuthenticated(authenticated);
      setUser(userData);
      setIsLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (useful for cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('[useAuth] Storage change detected for authToken');
        checkAuth();
      }
    };

    // Listen for custom auth state changes (same-tab updates)
    const handleAuthStateChange = (e: CustomEvent) => {
      console.log('[useAuth] Auth state change event:', e.detail);
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthStateChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthStateChange as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Attempting login for:', email);
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        console.log('[useAuth] Login successful, setting token');
        tokenManager.setToken(response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('[useAuth] Auth state updated to:', true);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('[useAuth] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[useAuth] Attempting logout');
      // Call backend logout API (optional, for token blacklisting)
      await authApi.logout();
    } catch (error) {
      // Even if backend call fails, we still want to logout locally
      console.error('Backend logout failed:', error);
    } finally {
      // Always remove token locally
      console.log('[useAuth] Clearing token and updating auth state');
      tokenManager.removeToken();
      setIsAuthenticated(false);
      setUser(null);
      console.log('[useAuth] Auth state updated to:', false);
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role?: string;
  }) => {
    try {
      console.log('[useAuth] Attempting registration for:', userData.email);
      const response = await authApi.register(userData);
      if (response.success && response.data) {
        console.log('[useAuth] Registration successful, setting token');
        tokenManager.setToken(response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('[useAuth] Auth state updated to:', true);
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('[useAuth] Registration error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
  };
};
