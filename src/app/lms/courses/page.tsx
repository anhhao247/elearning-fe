"use client"

import { useInstructorCourses, useCreateCourse } from "@/hooks/queries/use-instructor"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminCoursesPage() {
  const router = useRouter()
  const { data: courses = [], isLoading } = useInstructorCourses()
  const createCourse = useCreateCourse()
  const [isCreating, setIsCreating] = useState(false)

  const handleEdit = (id: number | string) => {
    router.push(`/lms/courses/${id}/edit`)
  }

  const handleAddCourse = async () => {
    try {
      setIsCreating(true)
      const newCourse = await createCourse.mutateAsync()
      toast.success("Đã tạo khóa học nháp thành công!")
      router.push(`/lms/courses/${newCourse.id}/edit`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tạo khóa học mới")
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-slate-500">Manage courses and course content</p>
        </div>
        <Button
          id="add-course-btn"
          className="bg-black hover:bg-black/90 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          onClick={handleAddCourse}
          disabled={isCreating}
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isCreating ? "Creating..." : "Add Course"}
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={courses} 
        loading={isLoading} 
        meta={{
          onEdit: handleEdit
        }}
      />
    </div>
  )
}
