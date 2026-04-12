"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { CreateCourseWizard } from "./_components/create-course-wizard"

const courses = [
  { id: 1, name: "xcxcxcx", slug: "/xcxcxcx", status: "Published", type: "Free", author: "superadmin", email: "admin@example.com", category: "fe", level: "Beginner", price: "0 đ" },
  { id: 2, name: "dsdsdsds", slug: "/dsdsdsds", status: "Published", type: "Paid", author: "superadmin", email: "admin@example.com", category: "fe", level: "Beginner", price: "333.333 đ" },
]

export default function AdminCoursesPage() {
  const [open, setOpen] = useState(false)

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
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Filter courses..." className="pl-10 h-10 border-slate-200 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 px-3 border-slate-200 gap-2 font-normal text-slate-600">
            <Plus className="h-4 w-4" /> Status
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-3 border-slate-200 gap-2 font-normal text-slate-600">
            <Plus className="h-4 w-4" /> Type
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-3 border-slate-200 gap-2 font-normal text-slate-600">
            <Plus className="h-4 w-4" /> Level
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-10 px-3 border-slate-200 gap-2 font-normal text-slate-600 ml-auto">
          <Filter className="h-4 w-4" /> View
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 w-4"><Input type="checkbox" className="h-4 w-4 rounded" /></th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4"><Input type="checkbox" className="h-4 w-4 rounded" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 leading-tight">{course.name}</div>
                        <div className="text-slate-400 text-xs mt-1">{course.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-black text-white px-2 py-0.5 pointer-events-none rounded-full font-medium">{course.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-900 px-3 py-0.5 rounded-full font-medium">{course.type}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold">S</div>
                      <div>
                        <div className="font-medium text-slate-900 leading-none">{course.author}</div>
                        <div className="text-slate-400 text-[10px] mt-1">{course.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-slate-500 border-slate-200 rounded-lg px-2 py-0.5 font-normal">{course.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-slate-500 border-slate-200 rounded-lg px-2 py-0.5 font-normal">{course.level}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{course.price}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-slate-500 text-sm">
          <div>2 of 2 row(s) shown.</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select className="border-slate-200 rounded px-2 py-1 bg-white outline-none">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <span>Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 opacity-50"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 opacity-50"><ChevronLeft className="h-4 w-4" /></Button>
              <Button className="h-8 w-8 bg-black text-white hover:bg-black rounded-lg">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 opacity-50"><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 opacity-50"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-3xl max-w-6xl w-full max-h-[90vh] flex flex-col p-0 gap-0"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <DialogTitle className="text-xl font-bold">Tạo khóa học mới</DialogTitle>
            <DialogDescription className="text-slate-500">
              Điền thông tin và cấu trúc nội dung cho khóa học của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CreateCourseWizard
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
