import { useQuery } from "@tanstack/react-query"
import { ReportService, ReportTargetContent } from "@/lib/services/report.service"

export function useAdminReportTargetContent(reportId: number | null, enabled: boolean) {
  return useQuery<ReportTargetContent>({
    queryKey: ["admin-report-target-content", reportId],
    queryFn: () => ReportService.getAdminReportTargetContent(reportId as number),
    enabled: enabled && !!reportId,
  })
}
