"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { User } from "@/store/useAuthStore"

interface UserAvatarProps {
  user: User | null
  className?: string
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  if (!user) return null

  const userInitials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.username.slice(0, 2).toUpperCase()

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage 
        src={user.avatar || ""} 
        alt={user.username} 
        className="object-cover"
      />
      <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700 font-medium">
        {userInitials}
      </AvatarFallback>
    </Avatar>
  )
}
