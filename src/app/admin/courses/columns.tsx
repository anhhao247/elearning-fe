"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CourseSubmission } from "@/types/admin-course"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import { format } from "date-fns"

import Link from "next/link"

export const columns: ColumnDef<CourseSubmission>[] = [
  {
    accessorKey: "title",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original
      return (
        <div className="flex items-center gap-3">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-12 h-10 object-cover rounded-md" />
          ) : (
            <div className="w-12 h-10 bg-slate-100 rounded-md flex items-center justify-center">
              <span className="text-xs text-slate-400">No Img</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 line-clamp-1">{course.title}</p>
            <p className="text-xs text-slate-500">{course.categoryName} • {course.level}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "instructorName",
    header: "Instructor",
    cell: ({ row }) => {
      const course = row.original
      return (
        <div>
          <p className="font-medium text-slate-700">{course.instructorName}</p>
          <p className="text-xs text-slate-500">@{course.instructorUsername}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "contentCount",
    header: "Content",
    cell: ({ row }) => {
      const course = row.original
      return (
        <div className="text-sm text-slate-600">
          <p>{course.moduleCount} modules</p>
          <p className="text-xs">{course.contentCount} lessons</p>
        </div>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-slate-600">
          {format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm")}
        </span>
      )
    },
  },
  {
    accessorKey: "approvalStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.approvalStatus
      if (status === "PENDING_REVIEW") {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending Review</Badge>
      }
      if (status === "APPROVED") {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Approved</Badge>
      }
      if (status === "REJECTED") {
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Rejected</Badge>
      }
      return <Badge variant="outline">{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original
      
      return (
        <div className="flex items-center gap-2">
          {course.approvalStatus === "PENDING_REVIEW" && (
            <Link href={`/admin/courses/${course.courseId}/review`}>
              <Button 
                variant="outline" 
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
]
