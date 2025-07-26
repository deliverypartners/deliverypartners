"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Car,
  CreditCard,
  LayoutDashboard,
  Percent,
  Users,
  Bell,
  FileText,
  X,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Drivers", href: "/admin/drivers", icon: Users },
  { title: "Vehicles", href: "/admin/vehicles", icon: Car },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Cities", href: "/admin/cities", icon: MapPin },
  { title: "Coupons", href: "/admin/coupons", icon: Percent },
  { title: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Reports", href: "/admin/reports", icon: FileText },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-white/30 md:hidden"
          onClick={onClose}
        />
      )}


      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-md transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:shadow-none md:flex"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b shrink-0">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Car className="h-6 w-6" />
              <span className="text-lg">TransportAdmin</span>
            </Link>
            <button className="md:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname.startsWith(item.href)
                    ? "bg-muted font-medium"
                    : "font-normal"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
