import { RoleGuard } from "@/components/auth/role-guard"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminNavbar } from "@/components/layout/admin-navbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRole="INSTRUCTOR">
      <div className="flex min-h-screen bg-slate-50/50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <AdminNavbar />
          <main className="flex-1 p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
