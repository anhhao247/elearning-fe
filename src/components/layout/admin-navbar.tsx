"use client"

import { Search, Bell, User as UserIcon, PanelLeft, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/layout/notification-bell"
import { UserAvatar } from "@/components/layout/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIconLucide } from "lucide-react"

export function AdminNavbar() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username.slice(0, 2).toUpperCase() || "AD"

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="text-slate-500 lg:inline-flex hidden">
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="relative max-w-md w-full ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 ml-2 pl-2 border-l cursor-pointer hover:bg-slate-50 transition-colors py-1 px-2 rounded-lg">
              <UserAvatar user={user} />
              <div className="lg:flex flex-col hidden">
                <span className="text-sm font-semibold leading-none">{user?.username}</span>
                <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{user?.role}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 lg:block hidden" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/my-profile")}>
              <UserIconLucide className="mr-2 h-4 w-4" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
