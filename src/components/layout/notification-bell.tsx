"use client"

import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/store/useNotificationStore"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount, notifications, clearNotifications, setUnreadCount } = useNotificationStore()

  const handleMarkAllAsRead = () => {
    setUnreadCount(0)
  }

  const handleClearAll = () => {
    clearNotifications()
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(date)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("text-slate-500 relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-semibold">Thông báo</p>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Đọc hết
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-destructive hover:bg-transparent"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Xóa
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-500">Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification, index) => (
                <DropdownMenuItem key={index} className="flex flex-col items-start gap-1 p-4 focus:bg-slate-50 cursor-default">
                  <div className="flex w-full justify-between items-start gap-2">
                    <p className="text-sm font-semibold leading-none">{notification.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-xs h-8" disabled>
                Xem tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
