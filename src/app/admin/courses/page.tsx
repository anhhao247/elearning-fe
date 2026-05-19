"use client"

import { useState } from "react"
import { 
  useAdminCourseSubmissions 
} from "@/hooks/queries/use-admin-courses"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default function AdminCoursesPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  
  const { data, isLoading, isError, error } = useAdminCourseSubmissions(
    pageIndex,
    10,
    statusFilter
  )

  const handleFilterStatus = (newStatus: string | undefined) => {
    setStatusFilter(newStatus)
    setPageIndex(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Submissions</h1>
          <p className="text-muted-foreground">
            Review and manage course submissions from instructors.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <p>Failed to load course submissions.</p>
          <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          pageCount={data?.totalPages || 0}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          loading={isLoading}
          onFilterStatus={handleFilterStatus}
        />
      )}
    </div>
  )
}
