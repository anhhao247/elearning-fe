"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { 
  Plus, 
  BarChart3, 
  BookOpen, 
  Clock, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Video,
  FileText,
  HelpCircle,
  GripVertical,
  Sparkles,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  useCourse, 
  useCourseOutline, 
  useDeleteModule, 
  useDeleteContent,
  useCreateModule,
  useCreateContent,
  useUpdateContent,
  useUpdateContentDetails,
  useUpdateModule,
  useCreateQuizQuestion,
  useUpdateQuizQuestion,
  useDeleteQuizQuestion,
  useSyncCourseAI,
  useSubmitCourse,
  usePublishCourse
} from "@/hooks/queries/use-instructor"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ModuleDialog } from "./_components/module-dialog"
import { LessonDialog } from "./_components/lesson-dialog"
import { AiOutlineDialog } from "./_components/ai-outline-dialog"
import { UploadVideoDialog } from "./_components/upload-video-dialog"
import { CreateCourseWizard } from "../../_components/create-course-wizard"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Stats Card Component ─────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className={cn("p-2.5 rounded-xl bg-opacity-10", colorClass)}>
        <Icon className={cn("w-5 h-5", colorClass.replace("bg-", "text-").split(" ")[0])} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ─── Lesson Item Component ─────────────────────────────────────────────────────

function LessonItem({ 
  lesson, 
  onEdit, 
  onDelete 
}: { 
  lesson: any; 
  onEdit: (lesson: any) => void;
  onDelete: (id: number) => void;
}) {
  const icons: any = {
    VIDEO: Video,
    READING: FileText,
    QUIZ: HelpCircle
  }
  const Icon = icons[lesson.contentType] || BookOpen

  return (
    <div className="group flex items-center gap-3 p-3 pl-8 bg-white hover:bg-slate-50 border-b last:border-0 border-slate-100 transition-colors">
      <GripVertical className="w-4 h-4 text-slate-200 group-hover:text-slate-400 cursor-grab" />
      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{lesson.title}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-blue-600"
          onClick={() => onEdit(lesson)}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-red-600"
          onClick={() => onDelete(lesson.contentId)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Module Block Component ────────────────────────────────────────────────────

function ModuleBlock({ 
  mod, 
  idx, 
  onEdit, 
  onDelete, 
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: { 
  mod: any; 
  idx: number;
  onEdit: (mod: any) => void;
  onDelete: (id: number) => void;
  onAddLesson: (moduleId: number) => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLesson: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white mb-4">
      <div 
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer transition-colors",
          isOpen ? "bg-slate-50/50" : "bg-white hover:bg-slate-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{mod.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{mod.contents.length} bài giảng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 hover:bg-blue-50 font-semibold h-8 px-2.5"
              onClick={() => onAddLesson(mod.moduleId)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Thêm bài giảng
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-blue-600"
              onClick={() => onEdit(mod)}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-red-600"
              onClick={() => onDelete(mod.moduleId)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-300 ml-1" /> : <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="bg-white">
          {mod.contents.length > 0 ? (
            mod.contents.map((lesson: any) => (
              <LessonItem 
                key={lesson.contentId} 
                lesson={lesson} 
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))
          ) : (
            <div className="p-6 text-center border-t border-slate-100">
               <p className="text-xs text-slate-400 italic">Chưa có bài giảng nào trong chương này.</p>
               <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-[10px] h-7 border-dashed"
                onClick={(e) => { e.stopPropagation(); onAddLesson(mod.moduleId); }}
               >
                 Tạo bài giảng đầu tiên
               </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseEditPage() {
  const { courseId } = useParams()
  
  // Queries
  const { data: course, isLoading: loadingCourse, refetch: refetchCourse } = useCourse(Number(courseId))
  const { data: syllabus, isLoading: loadingSyllabus, refetch } = useCourseOutline(Number(courseId))
  
  // Mutations
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  const deleteModule = useDeleteModule()
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()
  const deleteContent = useDeleteContent()
  const updateContentDetails = useUpdateContentDetails()
  const createQuizQuestion = useCreateQuizQuestion()
  const updateQuizQuestion = useUpdateQuizQuestion()
  const deleteQuizQuestion = useDeleteQuizQuestion()
  const syncAI = useSyncCourseAI()
  const submitCourseMutation = useSubmitCourse()
  const publishCourseMutation = usePublishCourse()

  // State for Dialogs
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; mode: "create" | "edit"; data?: any }>({
    open: false,
    mode: "create"
  })
  const [lessonDialog, setLessonDialog] = useState<{ 
    open: boolean; 
    mode: "create" | "edit"; 
    data?: any;
    moduleId?: number 
  }>({
    open: false,
    mode: "create"
  })
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean, contentId: number | null }>({
    open: false,
    contentId: null
  })

  const handleSyncAI = async () => {
    try {
      await syncAI.mutateAsync(courseId as string)
      toast.success("Đồng bộ AI thành công")
      refetchCourse()
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đồng bộ AI thất bại")
    }
  }

  const handleSubmitForReview = async () => {
    setIsSubmittingReview(true)
    try {
      await submitCourseMutation.mutateAsync(courseId as string)
      toast.success("🎉 Đã gửi đi xem xét thành công!", {
        description: "Khóa học của bạn đang chờ quản trị viên phê duyệt."
      })
      refetchCourse()
      refetch()
    } catch (error: any) {
      toast.error("Thất bại", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await publishCourseMutation.mutateAsync(courseId as string)
      toast.success("🎉 Xuất bản khóa học thành công!", {
        description: "Khóa học của bạn đã được hiển thị công khai trên hệ thống."
      })
      refetchCourse()
      refetch()
    } catch (error: any) {
      toast.error("Xuất bản thất bại", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    setIsUnpublishing(true)
    try {
      await publishCourseMutation.mutateAsync(courseId as string)
      toast.success("Đã gỡ khóa học khỏi trạng thái công khai!", {
        description: "Khóa học hiện đã được chuyển về trạng thái ẩn."
      })
      refetchCourse()
      refetch()
    } catch (error: any) {
      toast.error("Thao tác thất bại", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau.",
      })
    } finally {
      setIsUnpublishing(false)
    }
  }

  // Handlers for Module
  const handleAddModule = () => {
    setModuleDialog({ open: true, mode: "create" })
  }

  const handleEditModule = (mod: any) => {
    setModuleDialog({ open: true, mode: "edit", data: mod })
  }

  const handleDeleteModule = async (id: number) => {
    if (confirm("Xóa module sẽ xóa toàn bộ bài giảng bên trong. Tiếp tục?")) {
      await deleteModule.mutateAsync(id)
      toast.success("Đã xóa module")
      refetch()
    }
  }

  const onModuleSubmit = async (values: any) => {
    try {
      if (moduleDialog.mode === "create") {
        await createModule.mutateAsync({
          courseId: Number(courseId),
          payload: {
            ...values,
            moduleOrder: (syllabus?.length || 0) + 1
          }
        })
        toast.success("Đã thêm chương mới")
      } else {
        await updateModule.mutateAsync({
          moduleId: moduleDialog.data.moduleId,
          payload: values
        })
        toast.success("Đã cập nhật chương")
      }
      setModuleDialog({ ...moduleDialog, open: false })
      refetch()
    } catch (err) {
      toast.error("Thao tác thất bại")
    }
  }

  // Handlers for Lesson
  const handleAddLesson = (moduleId: number) => {
    setLessonDialog({ open: true, mode: "create", moduleId })
  }

  const handleEditLesson = (lesson: any) => {
    setLessonDialog({ open: true, mode: "edit", data: lesson })
  }

  const handleDeleteLesson = async (id: number) => {
    if (confirm("Xóa bài giảng này?")) {
      await deleteContent.mutateAsync(id)
      toast.success("Đã xóa bài giảng")
      refetch()
    }
  }

  const onLessonSubmit = async (values: any) => {
    try {
      const { title, contentType, platform, videoId, duration, body, description, passPercent, questions } = values

      let finalContentId: number | null = null

      if (lessonDialog.mode === "create") {
        // 1. Create content
        const createdContent = await createContent.mutateAsync({
          moduleId: lessonDialog.moduleId!,
          payload: {
            title,
            contentType,
            contentOrder: 99
          }
        })

        const currentContentId = createdContent.id || (createdContent as any).contentId;
        finalContentId = currentContentId;

        // 2. Update details
        if (contentType === "VIDEO") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              platform: platform || "YOUTUBE",
              videoId: videoId || "",
              duration: Number(duration) || 0
            }
          })
        } else if (contentType === "READING") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              body: body || ""
            }
          })
        } else if (contentType === "QUIZ") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              description: description || "",
              duration: Number(duration) || 0,
              passPercent: Number(passPercent) || 80
            }
          })

          if (questions && questions.length > 0) {
            for (const q of questions) {
              const payload = {
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options.map((opt: any) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect
                }))
              }
              await createQuizQuestion.mutateAsync({ contentId: currentContentId, payload })
            }
          }
        }
      } else {
        const currentContentId = lessonDialog.data.contentId
        finalContentId = currentContentId
        // Edit mode
        await updateContent.mutateAsync({
          contentId: currentContentId,
          payload: { title }
        })

        if (contentType === "VIDEO") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              platform: platform || "YOUTUBE",
              videoId: videoId || "",
              duration: Number(duration) || 0
            }
          })
        } else if (contentType === "READING") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              body: body || ""
            }
          })
        } else if (contentType === "QUIZ") {
          await updateContentDetails.mutateAsync({
            contentId: currentContentId,
            payload: {
              description: description || "",
              duration: Number(duration) || 0,
              passPercent: Number(passPercent) || 80
            }
          })

          if (questions) {
            // Handle quiz update
            const original = lessonDialog.data
            const existingQuestionIds = original?.questions?.map((q: any) => q.id) || []
            const currentQuestionIds = questions.map((q: any) => q.id).filter(Boolean)

            // Find deleted questions
            const deletedIds = existingQuestionIds.filter((id: number) => !currentQuestionIds.includes(id))
            for (const id of deletedIds) {
              await deleteQuizQuestion.mutateAsync(id)
            }

            // Update or Create remaining
            for (const question of questions) {
              const payload = {
                questionText: question.questionText,
                questionType: question.questionType,
                options: question.options.map((opt: any) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect
                }))
              }
              if (question.id) {
                await updateQuizQuestion.mutateAsync({ questionId: question.id, payload })
              } else {
                await createQuizQuestion.mutateAsync({ contentId: currentContentId, payload })
              }
            }
          }
        }
      }

      toast.success(lessonDialog.mode === "create" ? "Đã thêm bài giảng và cấu hình chi tiết" : "Đã cập nhật bài giảng")
      setLessonDialog({ ...lessonDialog, open: false })
      refetch()

      // Automatically open upload dialog if creating a Cloudflare video
      if (lessonDialog.mode === "create" && contentType === "VIDEO" && platform === "CLOUDFLARE" && finalContentId) {
        setUploadDialog({ open: true, contentId: finalContentId })
      }
    } catch (err: any) {
      console.error("Error in onLessonSubmit:", err);
      toast.error(err.message || "Thao tác thất bại, vui lòng thử lại.");
    }
  }

  if (loadingCourse || loadingSyllabus) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 w-64 bg-slate-200 rounded-lg mb-4" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 h-[600px] bg-slate-100 rounded-2xl" />
          <div className="col-span-8 h-[600px] bg-slate-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  const totalLessons = syllabus?.reduce((acc, m) => acc + m.contents.length, 0) || 0

  const isApproved = course?.approvalStatus === "APPROVED" || course?.approval_status === "APPROVED"
  const isPub = course?.isPublish || course?.is_publish
  const hasPending = course?.hasPendingUpdate || course?.has_pending_update
  const isModified = course?.contentModified || course?.content_modified

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            {course?.title || "Untitled Course"} 
            <Badge variant="outline" className={isPub ? "text-blue-600 bg-blue-50 border-blue-100" : "text-amber-600 bg-amber-50 border-amber-100"}>
              {isPub ? "Published" : "Draft"}
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Edit course details and manage content outline.</p>
        </div>
        <div className="flex items-center gap-2">
          {(course?.approvalStatus === "DRAFT" || course?.approval_status === "DRAFT") && (
            <Button
              className="bg-[#0a1128] hover:bg-[#0a1128]/90 text-white rounded-xl px-4 h-10 text-sm font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              onClick={handleSubmitForReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          )}
          {isApproved && !isPub && !hasPending && !isModified && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 text-sm font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Khóa Học"
              )}
            </Button>
          )}
          {isApproved && isPub && !hasPending && (
            <Button 
              variant="outline"
              className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-4 h-10 text-sm font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              onClick={handleUnpublish}
              disabled={isUnpublishing}
            >
              {isUnpublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                "Unpublish"
              )}
            </Button>
          )}
          <Button 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-4 h-10 text-sm font-bold flex items-center gap-2 shadow-sm border-none transition-transform active:scale-95"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            AI Syllabus Creator
          </Button>
          {/* <Button 
            variant="outline"
            className="border-slate-200 text-slate-700 rounded-xl px-4 h-10 text-sm font-bold flex items-center gap-2 transition-transform active:scale-95"
            onClick={handleSyncAI}
            disabled={syncAI.isPending}
          >
            {syncAI.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-500" />
            )}
            Đồng bộ AI
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Course Details */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 className="font-bold text-slate-800">Course Details</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <CreateCourseWizard 
              courseId={courseId as string} 
              onSuccess={() => refetch()} 
              onCancel={() => {}} 
            />
          </div>
        </div>

        {/* Right Column: Outline */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
            <h2 className="font-bold text-slate-800">Curriculum Outline</h2>
            <Button 
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 h-9 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
              onClick={handleAddModule}
            >
              <Plus className="w-4 h-4" /> Add Module
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Stats Section Small */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard icon={BarChart3} label="Modules" value={syllabus?.length || 0} colorClass="bg-blue-500" />
              <StatCard icon={BookOpen} label="Lessons" value={`${totalLessons}`} colorClass="bg-emerald-500" />
              <StatCard icon={Clock} label="Duration" value="0m" colorClass="bg-violet-500" />
              <StatCard icon={Eye} label="Status" value={course?.isPublish ? "Pub" : "Draft"} colorClass="bg-orange-500" />
            </div>

            {/* Outline Content */}
            <div className="space-y-2">
              {(syllabus?.length || 0) > 0 ? (
                syllabus?.map((mod, idx) => (
                  <ModuleBlock 
                    key={mod.moduleId} 
                    mod={mod} 
                    idx={idx} 
                    onEdit={handleEditModule}
                    onDelete={handleDeleteModule}
                    onAddLesson={handleAddLesson}
                    onEditLesson={handleEditLesson}
                    onDeleteLesson={handleDeleteLesson}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-slate-300" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có chương học nào</h3>
                   <p className="text-sm text-slate-500 max-w-xs mb-6">Bắt đầu xây dựng khóa học bằng cách tạo chương học đầu tiên.</p>
                   <Button 
                    className="bg-black hover:bg-black/90 text-white rounded-xl px-8 h-10 text-sm font-bold shadow-md"
                    onClick={handleAddModule}
                   >
                      Create First Module
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ModuleDialog 
        open={moduleDialog.open}
        onOpenChange={(open) => setModuleDialog({ ...moduleDialog, open })}
        mode={moduleDialog.mode}
        initialData={moduleDialog.data}
        onSubmit={onModuleSubmit}
        isSubmitting={createModule.isPending || updateModule.isPending}
      />

      <LessonDialog 
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog({ ...lessonDialog, open })}
        mode={lessonDialog.mode}
        initialData={lessonDialog.mode === "create" ? undefined : undefined}
        contentId={lessonDialog.data?.id ?? lessonDialog.data?.contentId ?? null}
        contentType={lessonDialog.data?.contentType}
        onSubmit={onLessonSubmit}
        isSubmitting={createContent.isPending || updateContent.isPending}
      />

      <AiOutlineDialog 
        open={aiDialogOpen} 
        onOpenChange={setAiDialogOpen}
        courseId={Number(courseId)}
        onSuccess={() => refetch()}
      />

      <UploadVideoDialog
        isOpen={uploadDialog.open}
        contentId={uploadDialog.contentId}
        onClose={() => setUploadDialog({ open: false, contentId: null })}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
