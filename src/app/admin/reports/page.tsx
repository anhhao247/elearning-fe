"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

import { useAdminReports } from "@/hooks/queries/use-admin-reports"
import { useAdminReportDetail } from "@/hooks/queries/use-admin-report-detail"
import { useAdminReportTargetContent } from "@/hooks/queries/use-admin-report-target-content"
import { ReportStatus, ReportTargetType } from "@/lib/services/report.service"
import { DataTable } from "./data-table"
import { reportColumns } from "./columns"
import { ReportDetailDialog } from "./_components/report-detail-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const STATUS_OPTIONS = ["PENDING", "RESOLVED", "DISMISSED"]
const TARGET_TYPE_OPTIONS = ["COURSE", "CONTENT"]
const SORT_DIR_OPTIONS = ["desc", "asc"]

export default function AdminReportsPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>(undefined)
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | undefined>(undefined)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data, isLoading, isError, error } = useAdminReports({
    page: pageIndex,
    size: pageSize,
    status: statusFilter,
    targetType: targetTypeFilter,
    sortBy: "createdAt",
    sortDir,
  })

  const {
    data: reportDetail,
    isLoading: isReportDetailLoading,
  } = useAdminReportDetail(selectedReportId, isDetailOpen)

  const {
    data: targetContentDetail,
    isLoading: isTargetContentLoading,
  } = useAdminReportTargetContent(
    selectedReportId,
    isDetailOpen && reportDetail?.targetType === "CONTENT"
  )

  const reports = data?.content ?? []
  const pageCount = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp báo cáo từ học viên về khóa học và bài học.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? undefined : (value as ReportStatus))
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={targetTypeFilter ?? "all"}
            onValueChange={(value) => {
              setTargetTypeFilter(value === "all" ? undefined : (value as ReportTargetType))
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Loại đối tượng" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả đối tượng</SelectItem>
              {TARGET_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortDir}
            onValueChange={(value) => {
              setSortDir(value as "asc" | "desc")
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {SORT_DIR_OPTIONS.map((dir) => (
                <SelectItem key={dir} value={dir}>
                    {dir === "desc" ? "Mới nhất" : "Cũ nhất"}
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
            <span className="font-semibold">Không thể tải danh sách report.</span>
          </div>
          <p className="mt-2 text-sm">
            {error instanceof Error ? error.message : "Đã xảy ra lỗi khi kết nối đến API."}
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={reportColumns}
            data={reports}
            pageCount={pageCount}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            loading={isLoading}
            meta={{
              onViewDetail: (report) => {
                setSelectedReportId(report.id)
                setIsDetailOpen(true)
              },
            }}
          />

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>Tổng: {totalElements} báo cáo</div>
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

      <ReportDetailDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedReportId(null)
        }}
        report={reportDetail ?? null}
        isReportLoading={isReportDetailLoading}
        contentDetail={targetContentDetail ?? null}
        isContentLoading={isTargetContentLoading}
      />
    </div>
  )
}
