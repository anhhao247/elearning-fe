"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { InstructorApplication, PaginatedResponse } from "@/types/instructor-application"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default function InstructorApplicationsPage() {
  const [data, setData] = useState<InstructorApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(0)

  const fetchApplications = useCallback(async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<PaginatedResponse<InstructorApplication>>(
        `/v1/admin/instructors/applications`,
        {
          params: {
            status: "PENDING",
            page: page,
            size: pageSize,
          },
        }
      )
      setData(response.data.content)
      setPageCount(response.data.totalPages)
    } catch (err: any) {
      console.error("Failed to fetch applications:", err)
      setError("Không thể tải danh sách đơn đăng ký. Vui lòng thử lại sau.")
      toast.error("Lỗi khi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchApplications(pageIndex)
  }, [fetchApplications, pageIndex])

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/v1/admin/instructors/applications/${id}/approve`)
      toast.success("Đã phê duyệt đơn đăng ký thành công")
      
      // Update local state: either refetch or filter out the item
      // Filtering is faster for UI responsiveness
      setData((prev) => prev.filter((item) => item.profileId !== id))
      
      // If the current page becomes empty and it's not the first page, go back
      if (data.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1)
      } else {
        // Optional: Refetch to keep total count and next items accurate
        // fetchApplications(pageIndex)
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
      
      setData((prev) => prev.filter((item) => item.profileId !== id))
      
      if (data.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1)
      }
    } catch (err: any) {
      console.error("Failed to reject application:", err)
      toast.error("Không thể từ chối đơn này. Vui lòng thử lại.")
    }
  }

  return (
    <div className="page-container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Giảng viên</h1>
        <p className="text-muted-foreground">
          Danh sách các tài khoản đang chờ phê duyệt để trở thành giảng viên trên hệ thống.
        </p>
      </div>

      {error ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/50">
          <p className="text-destructive mb-4 font-medium">{error}</p>
          <button 
            onClick={() => fetchApplications(pageIndex)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
          <DataTable 
            columns={columns} 
            data={data} 
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
