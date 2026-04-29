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
  useSyncCourseAI
} from "@/hooks/queries/use-instructor"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ModuleDialog } from "./_components/module-dialog"
import { LessonDialog } from "./_components/lesson-dialog"
import { AiOutlineDialog } from "./_components/ai-outline-dialog"

// ─── Stats Card Component ─────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
      <div className={cn("p-3 rounded-xl bg-opacity-10", colorClass)}>
        <Icon className={cn("w-6 h-6", colorClass.replace("bg-", "text-").split(" ")[0])} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
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
    <div className="group flex items-center gap-3 p-3 pl-10 bg-white hover:bg-slate-50 border-b last:border-0 border-slate-100 transition-colors">
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
          className="h-8 w-8 text-slate-400 hover:text-red-500"
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
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white mb-6">
      <div 
        className={cn(
          "flex items-center justify-between p-5 cursor-pointer transition-colors",
          isOpen ? "bg-slate-50/50" : "bg-white hover:bg-slate-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{mod.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{mod.contents.length} bài giảng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
             <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs font-semibold hover:bg-white"
              onClick={(e) => { e.stopPropagation(); onAddLesson(mod.moduleId); }}
             >
               <Plus className="w-3 h-3 mr-1.5" /> Add Lesson
             </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:bg-white"
                onClick={(e) => { e.stopPropagation(); onEdit(mod); }}
             >
               <Edit2 className="w-3.5 h-3.5" />
             </Button>
             <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:bg-white"
              onClick={(e) => { e.stopPropagation(); onDelete(mod.moduleId); }}
             >
               <Trash2 className="w-3.5 h-3.5" />
             </Button>
          </div>
          {isOpen ? <ChevronDown className="w-5 h-5 text-slate-300" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
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
            <div className="p-8 text-center border-t border-slate-100">
               <p className="text-sm text-slate-400 italic">Chưa có bài giảng nào trong chương này.</p>
               <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs border-dashed"
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

export default function CourseOutlinePage() {
  const { courseId } = useParams()
  
  // Queries
  const { data: course, isLoading: loadingCourse } = useCourse(Number(courseId))
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

  // State for Dialogs
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
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

  const handleSyncAI = async () => {
    try {
      await syncAI.mutateAsync(courseId as string)
      toast.success("Đồng bộ AI thành công")
      refetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đồng bộ AI thất bại")
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
    const id = lesson.contentId ?? lesson.id
    setLessonDialog({
      open: true,
      mode: "edit",
      data: {
        id,
        contentId: id,
        contentType: lesson.contentType,
        questions: []
      }
    })
  }

  const handleDeleteLesson = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài giảng này?")) {
      await deleteContent.mutateAsync(id)
      toast.success("Đã xóa bài giảng")
      refetch()
    }
  }

  const onLessonSubmit = async (values: any) => {
    try {
      let currentContentId = lessonDialog.data?.id || lessonDialog.data?.contentId

      const basePayload = {
        title: values.title,
        contentType: values.contentType,
        isPublish: values.isPublish,
      }

      if (lessonDialog.mode === "create") {
        const mod = syllabus?.find(m => m.moduleId === lessonDialog.moduleId)
        const createdContent = await createContent.mutateAsync({
          moduleId: lessonDialog.moduleId!,
          payload: {
            ...basePayload,
            description: values.description,
            contentOrder: (mod?.contents.length || 0) + 1
          }
        })
        currentContentId = createdContent?.id || (createdContent as any)?.contentId || (createdContent as any)?.data?.id || (createdContent as any)?.data?.contentId;
        
        if (!currentContentId) {
          console.error("Created content response:", createdContent);
          throw new Error("Không thể lấy ID của bài giảng vừa tạo.");
        }
      } else {
        // Optimized Update
        const original = values._originalData
        
        // 1. Check for General Info changes
        const isGeneralChanged = 
          values.title !== original?.title ||
          values.description !== (original?.description || "") ||
          values.isPublish !== original?.isPublish
          
        if (isGeneralChanged) {
          await updateContent.mutateAsync({
            contentId: currentContentId,
            payload: {
              title: values.title,
              description: values.description,
              isPublish: values.isPublish,
              contentType: values.contentType,
              contentOrder: original?.contentOrder || 0
            }
          })
        }

        // 2. Check for Details Info changes
        let isDetailsChanged = false
        let detailsPayload: any = {}
        
        if (values.contentType === "VIDEO") {
          isDetailsChanged = 
            values.platform !== original?.platform ||
            values.videoId !== original?.videoId ||
            values.duration !== original?.duration
          if (isDetailsChanged) {
            detailsPayload = { platform: values.platform, videoId: values.videoId, duration: values.duration }
          }
        } else if (values.contentType === "READING") {
          isDetailsChanged = values.body !== original?.body
          if (isDetailsChanged) {
            detailsPayload = { body: values.body }
          }
        } else if (values.contentType === "QUIZ") {
          isDetailsChanged = 
            values.description !== original?.description ||
            values.passPercent !== original?.passPercent ||
            values.duration !== original?.duration
          if (isDetailsChanged) {
            detailsPayload = { description: values.description, passPercent: values.passPercent, duration: values.duration }
          }
        }

        if (isDetailsChanged) {
          await updateContentDetails.mutateAsync({ 
            contentId: currentContentId, 
            payload: detailsPayload 
          })
        }

        // 3. Handle Quiz Questions Optimized
        if (values.contentType === "QUIZ" && values.questions) {
          if (values._originalQuestionIds?.length) {
            // Delete questions missing from form
            const currentQuestionIds = values.questions.map((q: any) => q.id).filter(Boolean)
            for (const originalId of values._originalQuestionIds) {
              if (!currentQuestionIds.includes(originalId)) {
                await deleteQuizQuestion.mutateAsync(originalId)
              }
            }
          }

          for (const question of values.questions) {
            const payload = {
              questionText: question.questionText,
              questionType: question.questionType,
              options: question.options.map((opt: any) => ({
                ...(opt.id && { id: opt.id }),
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
              }))
            }

            if (question.id) {
              // Only call PUT if question content changed
              const originalQ = original?.questions?.find((q: any) => q.id === question.id)
              const isQuestionChanged = !originalQ || 
                question.questionText !== originalQ.questionText ||
                question.questionType !== originalQ.questionType ||
                JSON.stringify(payload.options) !== JSON.stringify(originalQ.options)

              if (isQuestionChanged) {
                await updateQuizQuestion.mutateAsync({ questionId: question.id, payload })
              }
            } else {
              await createQuizQuestion.mutateAsync({ contentId: currentContentId, payload })
            }
          }
        }
      }

      toast.success(lessonDialog.mode === "create" ? "Đã thêm bài giảng và cấu hình chi tiết" : "Đã cập nhật bài giảng")
      setLessonDialog({ ...lessonDialog, open: false })
      refetch()
    } catch (err: any) {
      console.error("Error in onLessonSubmit:", err);
      toast.error(err.message || "Thao tác thất bại, vui lòng thử lại.");
    }
  }

  if (loadingCourse || loadingSyllabus) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-50 rounded-2xl" />
      </div>
    )
  }

  const totalLessons = syllabus?.reduce((acc, m) => acc + m.contents.length, 0) || 0

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            {course?.title} | Outline
            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">{course?.isPublish ? "Published" : "Draft"}</Badge>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Quản lý và tổ chức nội dung học tập theo chương mục.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-6 h-12 font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 border-none transition-transform active:scale-95"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="w-5 h-5" />
            Tạo nhanh Outline
          </Button>
          <Button 
            variant="outline"
            className="border-slate-200 text-slate-700 rounded-xl px-6 h-12 font-bold flex items-center gap-2 transition-transform active:scale-95"
            onClick={handleSyncAI}
            disabled={syncAI.isPending}
          >
            {syncAI.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-500" />
            )}
            Đồng bộ AI
          </Button>
          <Button 
            className="bg-black hover:bg-black/90 text-white rounded-xl px-6 h-12 font-bold flex items-center gap-2 shadow-lg shadow-black/10 transition-transform active:scale-95"
            onClick={handleAddModule}
          >
            <Plus className="w-5 h-5" /> Add Module
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={BarChart3} 
          label="Modules" 
          value={syllabus?.length || 0} 
          colorClass="bg-blue-600" 
        />
        <StatCard 
          icon={BookOpen} 
          label="Lessons" 
          value={`${totalLessons}`} 
          colorClass="bg-green-600" 
        />
        <StatCard 
          icon={Clock} 
          label="Duration" 
          value="0m" 
          colorClass="bg-purple-600" 
        />
        <StatCard 
          icon={Eye} 
          label="Published" 
          value="0%" 
          colorClass="bg-orange-600" 
        />
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
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-dashed border-slate-200 rounded-[32px] text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có chương học nào</h3>
             <p className="text-slate-500 max-w-sm mb-8">Bắt đầu xây dựng khóa học bằng cách tạo chương học đầu tiên ngay bây giờ.</p>
             <Button 
              className="bg-black hover:bg-black/90 text-white rounded-xl px-10 h-12 font-bold shadow-xl shadow-black/5"
              onClick={handleAddModule}
             >
                Create First Module
             </Button>
          </div>
        )}
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
    </div>
  )
}
