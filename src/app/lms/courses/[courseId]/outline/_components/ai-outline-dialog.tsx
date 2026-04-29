"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Wand2, Check, ExternalLink, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useGenerateOutlineAI, useSaveBulkOutline } from "@/hooks/queries/use-instructor"
import { toast } from "sonner"

interface AiOutlineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number | string
  onSuccess?: () => void
}

export function AiOutlineDialog({ open, onOpenChange, courseId, onSuccess }: AiOutlineDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [draftData, setDraftData] = useState<any>(null)

  const generateOutline = useGenerateOutlineAI()
  const saveBulkOutline = useSaveBulkOutline()

  // Form State
  const [topic, setTopic] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [objectives, setObjectives] = useState("")
  const [additionalRequirements, setAdditionalRequirements] = useState("")

  const handleGenerate = async () => {
    try {
      const response = await generateOutline.mutateAsync({
        topic,
        target_audience: targetAudience,
        objectives,
        additional_requirements: additionalRequirements
      })
      if (response && response.modules) {
         setDraftData(response)
         setStep(2)
      } else {
         toast.error("Không thể tạo Outline. Vui lòng thử lại.")
      }
    } catch (err: any) {
      console.error("Lỗi chi tiết khi gọi API Generate Outline:", err)
      
      let errorMessage = "Lỗi giao tiếp với AI. Vui lòng thử lại sau."
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`
      }
      
      toast.error(errorMessage)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const response = await saveBulkOutline.mutateAsync({
        courseId,
        outlineData: draftData
      })
      toast.success(response?.message || "Cấu trúc khóa học đã được lưu thành công 🎉")
      onOpenChange(false)
      if (onSuccess) onSuccess()
      // Reset state after close
      setTimeout(() => {
        setStep(1)
        setDraftData(null)
        setTopic("")
        setTargetAudience("")
        setObjectives("")
        setAdditionalRequirements("")
      }, 500)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu cấu trúc. Vui lòng thử lại.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Tạo cấu trúc khóa học với AI
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Cung cấp thông tin nền tảng để AI có thể thiết kế một lộ trình học phù hợp nhất."
              : "Xem trước bản nháp do AI đề xuất. Bạn có thể áp dụng nếu thấy hợp lý."}
          </DialogDescription>
        </DialogHeader>

        {/* ===================== STEP 1: FORM ===================== */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-semibold">Chủ đề khóa học (Bắt buộc)</Label>
                <Input
                  id="topic"
                  placeholder="Vd: Lập trình React.js cơ bản đến nâng cao"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-semibold">Đối tượng mục tiêu</Label>
                <Textarea
                  id="audience"
                  placeholder="Vd: Sinh viên IT, người mới học lập trình đã biết HTML/CSS..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="resize-none h-20"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-sm font-semibold">Mục tiêu khóa học</Label>
                <Textarea
                  id="objectives"
                  placeholder="Vd: Giúp học viên tự xây dựng được website cá nhân..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="resize-none h-20"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-semibold">Yêu cầu thêm (Tùy chọn)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Vd: Cần có nhiều bài tập thực hành, cấu trúc gồm 5 chương..."
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  className="resize-none h-20"
                  disabled={generateOutline.isPending}
                />
              </div>

              {/* Progress/Loading UI */}
              {generateOutline.isPending && (
                <div className="p-6 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center animate-in fade-in">
                  <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-50"></div>
                    <div className="relative bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center">
                      <Wand2 className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-indigo-900 mb-1">AI đang xử lý...</h4>
                  <p className="text-xs text-indigo-600/80 max-w-[250px]">
                    Quá trình này có thể mất từ 10-30 giây tùy thuộc vào độ phức tạp của yêu cầu.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={generateOutline.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                disabled={!topic || generateOutline.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                onClick={handleGenerate}
              >
                {generateOutline.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Tạo Outline AI
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ===================== STEP 2: PREVIEW ===================== */}
        {step === 2 && draftData && (
          <>
            <div className="flex-1 overflow-y-auto py-4 bg-slate-50/50 -mx-6 px-6 relative border-y border-slate-100">
              <div className="space-y-4">
                {draftData.modules.map((mod: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-sm">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.description}</p>
                    )}
                    
                    <div className="mt-3 space-y-2">
                      {mod.contents.map((content: any, cIdx: number) => (
                        <div key={cIdx} className="flex items-center gap-2 pl-3 py-1.5 border-l-2 border-indigo-100">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded bg-slate-50 uppercase shrink-0">
                            {content.type === 'VIDEO' ? '🎥 VIDEO' : content.type === 'QUIZ' ? '📝 QUIZ' : '📄 ĐỌC'}
                          </Badge>
                          <span className="text-xs font-medium text-slate-600 truncate">
                            {content.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="shrink-0 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Chỉnh sửa yêu cầu
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white min-w-[170px]"
                onClick={handleSaveDraft}
                disabled={saveBulkOutline.isPending}
              >
                {saveBulkOutline.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Áp dụng cấu trúc này
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
