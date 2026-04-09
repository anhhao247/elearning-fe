import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  role: string
  dob: string | null
  sex: string | null
  createdAt: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  initializeFromCookie: () => void
}

// Helper function to get auth token from cookies
export function getAuthTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null
  
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "auth_token" && value) {
      return decodeURIComponent(value)
    }
  }
  return null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ accessToken: null, user: null }),
      initializeFromCookie: () => {
        const token = getAuthTokenFromCookie()
        if (token) {
          set({ accessToken: token })
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
)

