"use client"

import { useWebSocket } from "@/hooks/useWebSocket"
import { useAuthStore } from "@/store/useAuthStore"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { _hasHydrated, accessToken } = useAuthStore()
  
  // Only initialize WebSocket if the store has hydrated and user is logged in
  useWebSocket()

  return <>{children}</>
}
