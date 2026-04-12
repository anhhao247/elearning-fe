"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useCompleteContent } from "@/hooks/queries/use-learning"
import { toast } from "sonner"

interface CompleteLessonButtonProps {
  contentId: number
  courseId: number
  isCompleted: boolean
}

export function CompleteLessonButton({ contentId, courseId, isCompleted }: CompleteLessonButtonProps) {
  const completeMutation = useCompleteContent(courseId)

  const handleComplete = async () => {
    if (isCompleted) return

    try {
      await completeMutation.mutateAsync(contentId)
      toast.success("🎉 Bài học đã được hoàn thành!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi xác nhận hoàn thành")
    }
  }

  if (isCompleted) {
    return (
      <Button 
        variant="outline" 
        className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 font-semibold transition-all flex items-center gap-2 px-6 py-5"
        disabled
      >
        <CheckCircle className="w-5 h-5 fill-emerald-600 text-white" />
        Đã hoàn thành bài học
      </Button>
    )
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={completeMutation.isPending}
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 shadow-sm transition-all hover:scale-[1.02] flex items-center gap-2"
    >
      {completeMutation.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      Hoàn thành bài học
    </Button>
  )
}
