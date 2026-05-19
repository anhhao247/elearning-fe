"use client"

import { RoleGuard } from "@/components/auth/role-guard"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminNavbar } from "@/components/layout/admin-navbar"
import { useSidebarStore } from "@/store/useSidebarStore"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed } = useSidebarStore()

  return (
    <RoleGuard allowedRole="INSTRUCTOR">
      <div className="flex min-h-screen bg-slate-50/50">
        <AdminSidebar />
        <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", isCollapsed ? "lg:pl-20" : "lg:pl-64")}>
          <AdminNavbar />
          <main className="flex-1 p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
