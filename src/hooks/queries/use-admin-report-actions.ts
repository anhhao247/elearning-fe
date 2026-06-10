import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ReportService,
  ReportResolutionPayload,
} from "@/lib/services/report.service"

const invalidateAdminReportQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
  queryClient.invalidateQueries({ queryKey: ["admin-report-detail"] })
  queryClient.invalidateQueries({ queryKey: ["admin-report-target-content"] })
}

export function useResolveAdminReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, payload }: { reportId: number; payload: { action: "DISMISS" } & ReportResolutionPayload }) =>
      ReportService.resolveAdminReport(reportId, payload),
    onSuccess: () => {
      invalidateAdminReportQueries(queryClient)
      toast.success("Đã từ chối báo cáo")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể từ chối báo cáo")
    },
  })
}

export function useHideReportCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, payload }: { reportId: number; payload: ReportResolutionPayload }) =>
      ReportService.hideReportCourse(reportId, payload),
    onSuccess: () => {
      invalidateAdminReportQueries(queryClient)
      toast.success("Đã ẩn khóa học")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể ẩn khóa học")
    },
  })
}

export function useBanReportInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, payload }: { reportId: number; payload: ReportResolutionPayload }) =>
      ReportService.banReportInstructor(reportId, payload),
    onSuccess: () => {
      invalidateAdminReportQueries(queryClient)
      toast.success("Đã khóa giảng viên")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể khóa giảng viên")
    },
  })
}