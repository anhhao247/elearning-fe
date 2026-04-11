"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/lib/axios"
import { toast } from "sonner"

/**
 * Component to initialize authentication state from cookies and fetch user data
 * This should be placed near the root of the app to run early
 */
export function AuthInitializer() {
  useEffect(() => {
    const initAuth = async () => {
      // Load token from cookie if present
      useAuthStore.getState().initializeFromCookie()

      // If token exists, fetch user data
      const token = useAuthStore.getState().accessToken
      if (token) {
        try {
          const userRes = await api.get("/users/me")
          useAuthStore.getState().setUser(userRes.data)

          // Check if this was an OAuth login
          if (document.cookie.includes("oauth_success=true")) {
            toast.success("Đăng nhập Google thành công!")
            // Clear the flag
            document.cookie = "oauth_success=; Max-Age=0; path=/;"
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          // Token might be invalid, clear auth
          useAuthStore.getState().clearAuth()
          toast.error("Phiên đăng nhập không còn hợp lệ")
        }
      }
    }

    initAuth()
  }, [])

  return null
}
