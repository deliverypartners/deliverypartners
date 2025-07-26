// Simple and secure admin authentication utility
export class AdminAuth {
  private static TOKEN_KEY = 'adminToken';
  private static COOKIE_NAME = 'adminToken';

  static setToken(token: string): void {
    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // Store in cookies for middleware access
    const maxAge = 86400; // 24 hours
    document.cookie = `${this.COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return;
    
    // Remove from localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    
    // Remove from cookies
    document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static logout(): void {
    this.removeToken();
    // Force redirect to login page
    window.location.href = '/admin/login';
  }

  // Simple token validation
  static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format check (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Try to decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
      
      // Check if it has admin role
      return payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  }

  static checkAuth(): boolean {
    const token = this.getToken();
    
    if (!token || !this.isValidToken(token)) {
      this.removeToken();
      return false;
    }
    
    return true;
  }
}
