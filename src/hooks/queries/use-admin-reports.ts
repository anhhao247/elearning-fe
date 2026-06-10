import { useQuery } from "@tanstack/react-query"
import { GetAdminReportsParams, PaginatedReports, ReportService } from "@/lib/services/report.service"

export function useAdminReports(params: GetAdminReportsParams) {
  return useQuery<PaginatedReports, Error>({
    queryKey: [
      "admin-reports",
      params.page ?? 0,
      params.size ?? 10,
      params.status ?? "",
      params.targetType ?? "",
      params.sortBy ?? "createdAt",
      params.sortDir ?? "desc",
    ],
    queryFn: () => ReportService.getAdminReports(params),
  })
}
