"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Ticket,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

const menuItems = [
  { name: "Dashboard", href: "/lms/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/lms/students", icon: Users },
  { name: "Courses", href: "/lms/courses", icon: BookOpen },
  { name: "Media", href: "/lms/media", icon: ImageIcon },
  { name: "Coupons", href: "/lms/coupons", icon: Ticket },
  { name: "Orders", href: "/lms/orders", icon: ShoppingCart },
  { name: "Profile", href: "/lms/profile", icon: ShieldCheck },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { clearAuth } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-black text-white p-2 rounded-lg">
          <BookOpen size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight">LMS</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-slate-100 text-black font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-black"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-black" : "text-slate-400 group-hover:text-black"
              )} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link
          href="/lms/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
            pathname === "/lms/settings"
              ? "bg-slate-100 text-black font-semibold" 
              : "text-slate-500 hover:bg-slate-50 hover:text-black"
          )}
        >
          <Settings className={cn(
            "w-5 h-5",
            pathname === "/lms/settings" ? "text-black" : "text-slate-400 group-hover:text-black"
          )} />
          <span className="text-sm">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-destructive hover:bg-destructive/5"
        >
          <LogOut className="w-5 h-5 text-destructive/70 group-hover:text-destructive" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 z-50 transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
