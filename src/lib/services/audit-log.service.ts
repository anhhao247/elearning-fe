import { api } from "@/lib/axios"

export interface AuditLog {
  id: number
  adminId: number
  adminUsername: string
  action: string
  targetType: string
  targetId: number
  note: string | null
  createdAt: string
}

export interface GetAuditLogsParams {
  page?: number
  size?: number
  keyword?: string
  action?: string
  targetType?: string
}

export interface PaginatedAuditLogs {
  content: AuditLog[]
  pageable: {
    sort: { sorted: boolean; unsorted: boolean; empty: boolean }
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  sort: { sorted: boolean; unsorted: boolean; empty: boolean }
  numberOfElements: number
  size: number
  number: number
  empty: boolean
}

export const AuditLogService = {
  getLogs: async (params?: GetAuditLogsParams): Promise<PaginatedAuditLogs> => {
    const response = await api.get("/v1/admin/audit-logs", { params })
    return response.data
  },
}
