"use client"

import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { InstructorApplication, PaginatedResponse } from "@/types/instructor-application"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function InstructorApplicationsPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-instructor-applications", pageIndex, pageSize, statusFilter],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<InstructorApplication>>(
        `/v1/admin/instructors/applications`,
        {
          params: {
            status: statusFilter === "ALL" ? undefined : statusFilter,
            page: pageIndex,
            size: pageSize,
          },
        }
      )
      return response.data
    },
    refetchOnWindowFocus: true, // Tự động refetch khi admin quay lại tab
    refetchInterval: 30000, // Tự động refetch mỗi 30 giây
    placeholderData: (previousData) => previousData,
  })

  const applicationsList = data?.content || []
  const pageCount = data?.totalPages || 0

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/v1/admin/instructors/applications/${id}/approve`)
      toast.success("Đã phê duyệt đơn đăng ký thành công")
      
      queryClient.invalidateQueries({ queryKey: ["admin-instructor-applications"] })
      
      if (applicationsList.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1)
      }
    } catch (err: any) {
      console.error("Failed to approve application:", err)
      toast.error("Không thể phê duyệt đơn này. Vui lòng thử lại.")
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
      await api.put(`/v1/admin/instructors/applications/${id}/reject`, { reason })
      toast.success("Đã từ chối đơn đăng ký")
      
      queryClient.invalidateQueries({ queryKey: ["admin-instructor-applications"] })
      
      if (applicationsList.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1)
      }
    } catch (err: any) {
      console.error("Failed to reject application:", err)
      toast.error("Không thể từ chối đơn này. Vui lòng thử lại.")
    }
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Giảng viên</h1>
          <p className="text-muted-foreground">
            Danh sách các tài khoản đăng ký trở thành giảng viên trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Trạng thái:</span>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value)
              setPageIndex(0) // Reset về trang đầu khi đổi filter
            }}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/50">
          <p className="text-destructive mb-4 font-medium">
            {error instanceof Error ? error.message : "Không thể tải danh sách đơn đăng ký. Vui lòng thử lại sau."}
          </p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
          <DataTable 
            columns={columns} 
            data={applicationsList} 
            loading={isLoading}
            pageCount={pageCount}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            // Passing handlers to columns via meta
            meta={{
              onApprove: handleApprove,
              onReject: handleReject,
            }}
          />
      )}
    </div>
  )
}
