"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { AdminAuth } from "@/lib/admin-auth"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      if (isLoginPage) {
        setIsLoading(false)
        return
      }

      const hasValidAuth = AdminAuth.checkAuth()
      
      if (!hasValidAuth) {
        // Clear any invalid tokens and redirect
        AdminAuth.removeToken()
        router.replace('/admin/login')
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router, isLoginPage])

  // Show loading spinner while checking auth (only for protected pages)
  if (isLoading && !isLoginPage) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show login page without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show access denied if not authenticated (fallback)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be logged in as an administrator to access this page.</p>
          <button 
            onClick={() => router.push('/admin/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render admin layout for authenticated users
  return (
    <div className="admin-panel flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64">
        <Sidebar isOpen={true} onClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar isOpen={true} onClose={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main layout */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          onMobileMenuClick={() => setMobileSidebarOpen(true)} 
          adminData={{
            email: 'admin@deliverypartner.com',
            fullName: 'System Administrator',
            role: 'ADMIN'
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}
