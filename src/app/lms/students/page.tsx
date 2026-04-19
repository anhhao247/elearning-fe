"use client"

import { useState } from "react"
import { useInstructorStudents } from "@/hooks/queries/use-instructor"
import { columns } from "./_components/columns"
import { StudentsDataTable } from "./_components/students-data-table"

export default function StudentsPage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState("")
  // Mặc định sắp xếp học viên tham gia gần nhất (lastEnrolledAt, desc)
  const [sort, setSort] = useState<string[]>(["lastEnrolledAt,desc"])

  const { data, isLoading } = useInstructorStudents({
    page,
    size,
    keyword,
    sort,
  })

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Học viên</h1>
        <p className="text-slate-500">Quản lý danh sách học viên trong các khóa học của bạn.</p>
      </div>
      
      <StudentsDataTable 
        columns={columns} 
        data={data?.content || []}
        pageCount={data?.totalPages || 0}
        pageIndex={page}
        pageSize={size}
        isLoading={isLoading}
        onPaginationChange={(pageIndex, pageSize) => {
          setPage(pageIndex)
          setSize(pageSize)
        }}
        onKeywordChange={(val) => {
           setKeyword(val)
           setPage(0)
        }}
        onSortChange={(field, direction) => {
           setSort([`${field},${direction}`])
        }}
      />
    </div>
  )
}
