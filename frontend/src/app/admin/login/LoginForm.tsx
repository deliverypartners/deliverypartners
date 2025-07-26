'use client';

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminAuth } from "@/lib/admin-auth";

// Define the validation schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "vendor">("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;
      console.log('Admin login: Attempting login for:', data.email);
      console.log('API URL:', API_URL);
      console.log('Full login URL:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      console.log('Admin login: Response status:', response.status);
      console.log('Admin login: Response content-type:', response.headers.get('content-type'));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Admin login: Non-JSON response received:', textResponse);
        throw new Error('Server returned an invalid response. Please check if the backend is running.');
      }
      
      const result = await response.json();
      console.log('Admin login: Response data:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }

      // Check if user has admin privileges
      const user = result.data.user;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store the JWT token for subsequent API calls
      AdminAuth.setToken(result.data.token);
      
      console.log('Admin login successful, token stored in localStorage and cookies');

      // For admin login, we'll redirect to dashboard
      router.push('/admin/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/authbg.jpg')" }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden"
      >
        {/* Left Side: Logo */}
        <div className="w-full md:w-1/2 bg-white/10 flex items-center justify-center py-16 px-6">
          <img
            src="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/dp%20logo.jpg?updatedAt=1752338033789"
            alt="Logo"
            width={300}
            height={200}
            className="max-w-xs w-full h-auto"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-6 gap-2">
              <button
                onClick={() => setRole("admin")}
                className={`px-5 py-2 rounded text-sm ${
                  role === "admin"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                Admin
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <input
                {...form.register("email")}
                type="text"
                placeholder="Login id"
                className="w-full bg-white px-4 py-2 rounded border border-gray-300 text-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {form.formState.errors.email && (
                <p className="text-red-500">{form.formState.errors.email.message}</p>
              )}

              <input
                {...form.register("password")}
                type="password"
                placeholder="Login password"
                className="w-full bg-white px-4 py-2 rounded border border-gray-300 text-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {form.formState.errors.password && (
                <p className="text-red-500">{form.formState.errors.password.message}</p>
              )}

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <div className="text-right text-sm mt-[-10px]">
                <a href="#" className="text-blue-600 hover:underline">
                  Forget your password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
