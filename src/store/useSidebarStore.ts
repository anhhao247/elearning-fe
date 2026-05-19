import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean // For mobile drawer
  isCollapsed: boolean // For desktop mini sidebar
  toggleOpen: () => void
  setIsOpen: (open: boolean) => void
  toggleCollapse: () => void
  setIsCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (open) => set({ isOpen: open }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}))
