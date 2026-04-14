import { create } from "zustand"

interface Notification {
  id?: string
  title: string
  message: string
  createdAt?: string
}

interface NotificationState {
  unreadCount: number
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  setUnreadCount: (count: number) => void
  clearNotifications: () => void
  decrementCount: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, createdAt: notification.createdAt || new Date().toISOString() },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  decrementCount: () => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - 1) 
  })),
}))
