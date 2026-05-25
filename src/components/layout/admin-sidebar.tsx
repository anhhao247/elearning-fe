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
  X,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useSidebarStore } from "@/store/useSidebarStore"

const menuItems = [
  { name: "Dashboard", href: "/lms/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/lms/students", icon: Users },
  { name: "Courses", href: "/lms/courses", icon: BookOpen },
  { name: "Media", href: "/lms/media", icon: ImageIcon },
  { name: "Coupons", href: "/lms/coupons", icon: Ticket },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { clearAuth } = useAuthStore()
  const { isOpen, setIsOpen, toggleOpen, isCollapsed } = useSidebarStore()

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className={cn("p-6 flex items-center gap-3", collapsed ? "justify-center px-4" : "")}>
        <div className="bg-black text-white p-2 rounded-lg flex-shrink-0">
          <BookOpen size={20} />
        </div>
        {!collapsed && <span className="font-bold text-xl tracking-tight truncate">LMS</span>}
      </div>
      
      <nav className={cn("flex-1 space-y-1 overflow-y-auto pt-4", collapsed ? "px-2" : "px-4")}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group",
                collapsed ? "justify-center px-0" : "px-3",
                isActive 
                  ? "bg-slate-100 text-black font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-black"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-black" : "text-slate-400 group-hover:text-black"
              )} />
              {!collapsed && <span className="text-sm truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link
          href="/lms/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group",
            collapsed ? "justify-center px-0" : "px-3",
            pathname === "/lms/settings"
              ? "bg-slate-100 text-black font-semibold" 
              : "text-slate-500 hover:bg-slate-50 hover:text-black"
          )}
        >
          <Settings className={cn(
            "w-5 h-5 flex-shrink-0",
            pathname === "/lms/settings" ? "text-black" : "text-slate-400 group-hover:text-black"
          )} />
          {!collapsed && <span className="text-sm truncate">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? "Đăng xuất" : undefined}
          className={cn(
            "flex w-full items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group text-destructive hover:bg-destructive/5",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className="w-5 h-5 text-destructive/70 group-hover:text-destructive flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium truncate">Đăng xuất</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleOpen}>
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent collapsed={isCollapsed} />
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
        <SidebarContent collapsed={false} />
      </aside>
    </>
  )
}
