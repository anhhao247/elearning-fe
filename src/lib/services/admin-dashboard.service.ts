import { api } from '../axios'

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface DashboardOverview {
  totalStudents: number
  totalInstructors: number
  totalCourses: number
  totalRevenue: number
  pendingInstructorApplications: number
}

export interface RecentActivity {
  type: 'ORDER' | 'REFUND_REQUEST' | 'INSTRUCTOR_APPLICATION' | 'ENROLLMENT' | string
  actorId: number
  actorName: string
  description: string
  createdAt: string
}

export interface RevenueStatItem {
  label: string
  totalRevenue: number
}

export interface RevenueStats {
  period: 'daily' | 'monthly' | 'yearly'
  startDate: string
  endDate: string
  items: RevenueStatItem[]
}

export type RevenuePeriod = 'daily' | 'monthly' | 'yearly'

// ─── Service ───────────────────────────────────────────────────────────────

export const AdminDashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await api.get('/v1/admin/dashboard/overview')
    return res.data
  },

  getRecentActivities: async (limit = 10): Promise<RecentActivity[]> => {
    const res = await api.get('/v1/admin/dashboard/recent-activities', {
      params: { limit },
    })
    return res.data
  },

  getRevenueStats: async (period: RevenuePeriod): Promise<RevenueStats> => {
    const res = await api.get('/v1/admin/dashboard/revenue-stats', {
      params: { period },
    })
    return res.data
  },
}
