import { useQuery } from '@tanstack/react-query'
import {
  AdminDashboardService,
  RevenuePeriod,
} from '@/lib/services/admin-dashboard.service'

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: AdminDashboardService.getOverview,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminRecentActivities(limit = 10) {
  return useQuery({
    queryKey: ['admin-recent-activities', limit],
    queryFn: () => AdminDashboardService.getRecentActivities(limit),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminRevenueStats(period: RevenuePeriod) {
  return useQuery({
    queryKey: ['admin-revenue-stats', period],
    queryFn: () => AdminDashboardService.getRevenueStats(period),
    staleTime: 1000 * 60 * 5,
  })
}
