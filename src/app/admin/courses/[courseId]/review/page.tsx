"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAdminCourseDetail, useApproveCourse, useRejectCourse } from "@/hooks/queries/use-admin-courses"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { ChevronLeft, PlayCircle, FileText, CheckSquare, Eye } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AdminContent } from "@/types/admin-course"

export default function CourseReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const courseId = parseInt(resolvedParams.courseId)
  
  const { data: course, isLoading, isError } = useAdminCourseDetail(courseId)
  const approveMutation = useApproveCourse()
  const rejectMutation = useRejectCourse()

  const [selectedContent, setSelectedContent] = useState<AdminContent | null>(null)
  
  // Action Dialog State
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  if (isLoading) {
    return <div className="p-8 text-center">Loading course details...</div>
  }

  if (isError || !course) {
    return <div className="p-8 text-center text-red-500">Error loading course.</div>
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(courseId)
      toast.success("Đã phê duyệt khóa học")
      router.push("/admin/courses")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi phê duyệt")
    } finally {
      setActionType(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    try {
      await rejectMutation.mutateAsync({ courseId, reason: rejectReason })
      toast.success("Đã từ chối khóa học")
      router.push("/admin/courses")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi từ chối")
    } finally {
      setActionType(null)
      setRejectReason("")
    }
  }

  const isPending = approveMutation.isPending || rejectMutation.isPending

  const getIconForType = (type: string) => {
    switch (type) {
      case "VIDEO": return <PlayCircle className="w-4 h-4" />
      case "READING": return <FileText className="w-4 h-4" />
      case "QUIZ": return <CheckSquare className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 -m-6">
      {/* Sticky Moderator Bar */}
      <div className="sticky top-0 z-10 bg-[#fdf5e6] border-b border-[#ebd7ba] p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm text-[#8b5a2b]/80 mt-1">
            Khóa học: {course.title}
          </p>
          <p className="text-sm text-[#8b5a2b]/80 mt-1">
            Giảng viên: {course.instructor.fullName}   -   
            Gửi lúc: {course.submittedAt ? format(new Date(course.submittedAt), "dd/MM/yyyy HH:mm") : "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm" className="text-[#8b5a2b]">
              <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
            onClick={() => setActionType("REJECT")}
            disabled={course.approvalStatus !== "PENDING_REVIEW"}
          >
            Từ chối
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setActionType("APPROVE")}
            disabled={course.approvalStatus !== "PENDING_REVIEW"}
          >
            Duyệt
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Curriculum */}
        <div className="w-80 bg-white border-r flex flex-col overflow-y-auto">
          <div className="p-4 border-b bg-slate-50/50 sticky top-0 z-10">
            <h3 className="font-semibold text-slate-800">Curriculum</h3>
            <p className="text-xs text-slate-500">{course.stats.moduleCount} modules • {course.stats.contentCount} contents</p>
          </div>
          
          <div className="p-2">
            <Accordion type="multiple" defaultValue={course.curriculum.map(m => m.moduleId.toString())} className="w-full">
              {course.curriculum.map((module) => (
                <AccordionItem key={module.moduleId} value={module.moduleId.toString()} className="border-none">
                  <AccordionTrigger className="px-3 py-2 hover:bg-slate-50 rounded-md text-sm font-semibold">
                    {module.title}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2">
                    <div className="flex flex-col gap-1">
                      {module.contents.map((content) => {
                        const isSelected = selectedContent?.contentId === content.contentId
                        return (
                          <button
                            key={content.contentId}
                            onClick={() => setSelectedContent(content)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                              isSelected 
                                ? "bg-slate-900 text-white" 
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <span className={cn("opacity-70", isSelected && "opacity-100")}>
                              {getIconForType(content.contentType)}
                            </span>
                            <span className="truncate">{content.title}</span>
                          </button>
                        )
                      })}
                      {module.contents.length === 0 && (
                        <p className="text-xs text-slate-400 px-3 py-1 italic">Trống</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Right Column - Content Renderer */}
        <div className="flex-1 bg-white overflow-y-auto p-8">
          {!selectedContent ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p>Chọn một bài học từ menu bên trái để xem trước nội dung</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  {getIconForType(selectedContent.contentType)}
                  <span>{selectedContent.contentType}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedContent.title}</h1>
              </div>

              <div className="prose prose-slate max-w-none">
                {selectedContent.contentType === "READING" && selectedContent.reading && (
                  <div dangerouslySetInnerHTML={{ __html: selectedContent.reading.body }} />
                )}
                
                {selectedContent.contentType === "VIDEO" && selectedContent.video && (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <p className="text-white/50">Video Placeholder: {selectedContent.video.videoId}</p>
                  </div>
                )}
                
                {selectedContent.contentType === "QUIZ" && selectedContent.quiz && (
                  <div className="space-y-4">
                    <p>{selectedContent.quiz.description}</p>
                    <div className="bg-slate-50 p-4 rounded-lg border">
                      <p className="font-semibold">Quiz Details</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>Duration: {selectedContent.quiz.duration} minutes</li>
                        <li>Pass percentage: {selectedContent.quiz.passPercent}%</li>
                        <li>Questions: {selectedContent.quiz.questions?.length || 0}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialogs */}
      <AlertDialog open={actionType !== null} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "APPROVE" ? "Phê duyệt khóa học" : "Từ chối khóa học"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "APPROVE" ? (
                "Bạn có chắc chắn muốn duyệt khóa học này? Khóa học sẽ được public lên hệ thống."
              ) : (
                "Vui lòng nhập lý do từ chối để giảng viên có thể sửa lại."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === "REJECT" && (
            <div className="py-4">
              <Textarea 
                placeholder="Ví dụ: Video bài 1 bị rè, vui lòng thu âm lại..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={actionType === "APPROVE" ? handleApprove : handleReject}
              disabled={isPending}
              className={actionType === "REJECT" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
