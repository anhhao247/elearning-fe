"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminAuditLogs } from '@/hooks/queries/use-admin-audit-logs'
import { DataTable } from './data-table'
import { auditLogColumns } from './columns'
import { AlertCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const ACTION_OPTIONS = [
  'BAN_USER',
  'UNBAN_USER',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'CREATE_COURSE',
  'UPDATE_COURSE',
  'DELETE_COURSE',
]
const TARGET_TYPE_OPTIONS = ['USER', 'COURSE', 'CATEGORY', 'INSTRUCTOR', 'PAYMENT']

export default function AdminAuditLogsPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1])
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined)
  const [targetTypeFilter, setTargetTypeFilter] = useState<string | undefined>(undefined)

  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user?.adminRole === 'CONTENT_MODERATOR' || user?.admin_role === 'CONTENT_MODERATOR') {
      router.push('/admin/dashboard')
    }
  }, [user, router])

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const { data, isLoading, isError, error } = useAdminAuditLogs({
    page: pageIndex,
    size: pageSize,
    keyword: debouncedSearchTerm || undefined,
    action: actionFilter,
    targetType: targetTypeFilter,
  })

  const auditLogs = data?.content ?? []
  const pageCount = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Ghi nhận các thao tác admin với hệ thống, bao gồm hành động, đối tượng và thời điểm.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative col-span-4 md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm admin, hành động, ghi chú..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPageIndex(0)
              }}
            />
          </div>

          <Select
            value={actionFilter ?? 'all'}
            onValueChange={(value) => {
              setActionFilter(value === 'all' ? undefined : value)
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hành động</SelectItem>
              {ACTION_OPTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={targetTypeFilter ?? 'all'}
            onValueChange={(value) => {
              setTargetTypeFilter(value === 'all' ? undefined : value)
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {TARGET_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Không thể tải audit logs.</span>
          </div>
          <p className="mt-2 text-sm">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi kết nối đến API.'}
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={auditLogColumns}
            data={auditLogs}
            pageCount={pageCount}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            loading={isLoading}
          />

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>Tổng: {totalElements} bản ghi</div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <span>Số bản ghi/trang:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Kích thước trang" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
