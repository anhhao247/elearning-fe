import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AuditLogService, GetAuditLogsParams, PaginatedAuditLogs } from '@/lib/services/audit-log.service'

export function useAdminAuditLogs(params: GetAuditLogsParams): UseQueryResult<PaginatedAuditLogs, Error> {
  return useQuery<PaginatedAuditLogs, Error>({
    queryKey: [
      'admin-audit-logs',
      params.page ?? 0,
      params.size ?? 20,
      params.keyword ?? '',
      params.action ?? '',
      params.targetType ?? '',
    ],
    queryFn: () => AuditLogService.getLogs(params),
  })
}
