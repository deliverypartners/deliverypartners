"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Debug logging
  console.log("[Navbar] Render state:", { isAuthenticated, isLoading });

  const handleLogout = async () => {
    try {
      console.log("[Navbar] Logout button clicked");
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout fails
      router.push("/");
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/Screenshot_2025-07-19_234547-removebg-preview.png?updatedAt=1752949895120"
                  alt="Logo"
                  className="w-12 h-10 rounded-xl object-cover"
                />
                <span className="text-2xl font-bold" style={{color: '#1ca1da'}}>
                  Delivery Partners®
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/support">
              <Button
                variant="outline"
                className="inline-flex items-center px-4 py-2 border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium"
              >
                <HelpCircle className="mr-2 h-4 w-4 text-blue-600" />
                <span>Support</span>
              </Button>
            </Link>

            {isLoading ? (
              <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse"></div>
            ) : isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button
                    variant="outline"
                    className="inline-flex items-center px-4 py-2 border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium"
                  >
                    <User className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Profile</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="inline-flex items-center px-4 py-2 border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-500 ease-in-out",
          isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-2 pb-3 space-y-3 px-4 transform transition-all duration-300 delay-100">
          <Link
            href="/support"
            className="block transform transition-all duration-200 hover:scale-105"
          >
            <Button
              variant="outline"
              className="w-full justify-center border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
            >
              <HelpCircle className="mr-2 h-4 w-4 text-blue-600" />
              <span>Support</span>
            </Button>
          </Link>

          {isLoading ? (
            <div className="w-full h-10 bg-gray-100 rounded-xl animate-pulse"></div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="block transform transition-all duration-200 hover:scale-105"
              >
                <Button
                  variant="outline"
                  className="w-full justify-center border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-all duration-200"
                >
                  <User className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-center border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-all duration-200"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-600" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Link
              href="/auth"
              className="block transform transition-all duration-200 hover:scale-105"
            >
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
