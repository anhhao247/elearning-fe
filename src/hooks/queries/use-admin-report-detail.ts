import { useQuery } from "@tanstack/react-query"
import { ReportService, Report } from "@/lib/services/report.service"

export function useAdminReportDetail(reportId: number | null, enabled: boolean) {
  return useQuery<Report>({
    queryKey: ["admin-report-detail", reportId],
    queryFn: () => ReportService.getAdminReportDetail(reportId as number),
    enabled: enabled && !!reportId,
  })
}
