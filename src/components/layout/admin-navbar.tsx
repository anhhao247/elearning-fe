"use client"

import { Search, Bell, User as UserIcon, PanelLeft, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminNavbar() {
  const { user } = useAuthStore()

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
        <Button variant="ghost" size="icon" className="text-slate-500 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="flex items-center gap-3 ml-2 pl-2 border-l">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="lg:flex flex-col hidden">
            <span className="text-sm font-semibold leading-none">{user?.username}</span>
            <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{user?.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 lg:block hidden" />
        </div>
      </div>
    </header>
  )
}
