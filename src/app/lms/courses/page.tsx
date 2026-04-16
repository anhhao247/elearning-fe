"use client"

import { CreateCourseWizard } from "./_components/create-course-wizard"
import { useInstructorCourses } from "@/hooks/queries/use-instructor"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus } from "lucide-react"

export default function AdminCoursesPage() {
  const [open, setOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | string | null>(null)
  
  const { data: courses = [], isLoading } = useInstructorCourses()

  const handleEdit = (id: number | string) => {
    setEditingCourseId(id)
    setOpen(true)
  }

  const handleAddCourse = () => {
    setEditingCourseId(null)
    setOpen(true)
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
        >
          <Plus className="h-4 w-4" /> Add Course
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

      {/* Create Course Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-3xl max-w-6xl w-full max-h-[90vh] flex flex-col p-0 gap-0"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {editingCourseId ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingCourseId 
                ? "Cập nhật thông tin và cấu trúc nội dung cho khóa học của bạn."
                : "Điền thông tin và cấu trúc nội dung cho khóa học của bạn."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CreateCourseWizard
              courseId={editingCourseId ?? undefined}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
