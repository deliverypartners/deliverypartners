"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
});

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;

// Admin login function that connects to backend
async function authenticateAdmin(email: string, password: string) {
  try {
    console.log('Admin auth: Attempting login for:', email);
    console.log('Admin auth: API URL:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Admin auth: Response status:', response.status);
    const data = await response.json();
    console.log('Admin auth: Response data:', data);

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Login failed' };
    }

    // Check if user has admin privileges
    const user = data.data.user;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return { 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      };
    }

    return {
      success: true,
      user: user,
      token: data.data.token
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { 
      success: false, 
      message: `Authentication service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Login action used with useFormState
export async function login(_prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Authenticate with backend
  const authResult = await authenticateAdmin(email, password);

  if (!authResult.success) {
    return {
      success: false,
      errors: {
        email: [authResult.message || "Invalid email or password"],
      },
    };
  }

  // Create session with user ID and store additional admin info
  await createSession(authResult.user.id, {
    email: authResult.user.email,
    fullName: authResult.user.fullName,
    role: authResult.user.role,
    token: authResult.token
  });

  // Redirect to admin dashboard
  redirect("/admin/dashboard");
}

// Logout action
export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
