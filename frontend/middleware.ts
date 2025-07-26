import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only process admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  console.log('[Middleware] Processing admin route:', pathname);
  
  // Get admin token from cookies
  const adminToken = req.cookies.get("adminToken")?.value;
  
  console.log('[Middleware] Token check:', {
    pathname,
    hasToken: !!adminToken
  });

  // Redirect /admin to /admin/login
  if (pathname === "/admin" || pathname === "/admin/") {
    console.log('[Middleware] Redirecting /admin to /admin/login');
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Allow access to login page
  if (pathname === "/admin/login") {
    // If user is already authenticated, redirect to dashboard
    if (adminToken) {
      console.log('[Middleware] User already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // For all other admin routes, require authentication
  if (!adminToken) {
    console.log('[Middleware] No token found, redirecting to login');
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Verify the token is valid (basic check)
  try {
    // Simple token format check
    if (!adminToken.includes('.') || adminToken.length < 10) {
      console.log('[Middleware] Invalid token format, redirecting to login');
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete('adminToken');
      return response;
    }
  } catch (error) {
    console.log('[Middleware] Token validation failed, redirecting to login');
    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.delete('adminToken');
    return response;
  }

  console.log('[Middleware] Token validated, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
