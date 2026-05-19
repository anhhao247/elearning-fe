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
  adminRole?: string | null
  admin_role?: string | null
  dob: string | null
  sex: string | boolean | null
  createdAt: string
  instructorStatus?: string | null
  rejectionReason?: string | null
  canResubmit?: boolean
  resubmitAvailableAt?: string | null
}

interface AuthState {
  accessToken: string | null
  user: User | null
  _hasHydrated: boolean
  isLoggingOut: boolean
  setHasHydrated: (state: boolean) => void
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
      _hasHydrated: false,
      isLoggingOut: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setToken: (token) => set({ accessToken: token, isLoggingOut: false }),
      setUser: (user) => set({ user, isLoggingOut: false }),
      clearAuth: () => set({ accessToken: null, user: null, isLoggingOut: true }),
      initializeFromCookie: () => {
        const token = getAuthTokenFromCookie()
        if (token) {
          set({ accessToken: token })
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

