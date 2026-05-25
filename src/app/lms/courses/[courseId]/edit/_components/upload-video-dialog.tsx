"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, UploadCloud, Video, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { 
  useVideoPresign, 
  useVideoUploadComplete, 
  useVideoStatus 
} from "@/hooks/queries/use-instructor"
import { cn } from "@/lib/utils"

interface UploadVideoDialogProps {
  contentId: number | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type UploadStep = 'SELECT_FILE' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'

export function UploadVideoDialog({ contentId, isOpen, onClose, onSuccess }: UploadVideoDialogProps) {
  const [step, setStep] = useState<UploadStep>('SELECT_FILE')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const presignMutation = useVideoPresign()
  const completeMutation = useVideoUploadComplete()
  
  // Polling will only be enabled when step is 'PROCESSING'
  const { data: videoStatus } = useVideoStatus(step === 'PROCESSING' ? contentId : null)

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setStep('SELECT_FILE')
      setFile(null)
      setProgress(0)
      setErrorMessage("")
    }
  }, [isOpen])

  useEffect(() => {
    if (step === 'PROCESSING' && videoStatus) {
      if (videoStatus.uploadStatus === 'READY') {
        setStep('SUCCESS')
        toast.success("Xử lý video hoàn tất!")
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else if (videoStatus.uploadStatus === 'FAILED') {
        setStep('ERROR')
        setErrorMessage("Lỗi khi xử lý video trên Cloudflare.")
      }
    }
  }, [videoStatus, step, onSuccess, onClose])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        toast.error("Vui lòng chọn file video hợp lệ (mp4, webm,...)")
        return
      }
      // Check file size (e.g., max 2GB)
      const MAX_SIZE = 2 * 1024 * 1024 * 1024
      if (selectedFile.size > MAX_SIZE) {
        toast.error("File quá lớn. Vui lòng chọn file dưới 2GB.")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!droppedFile.type.startsWith('video/')) {
        toast.error("Vui lòng chọn file video hợp lệ (mp4, webm,...)")
        return
      }
      setFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !contentId) return
    
    try {
      setStep('UPLOADING')
      setProgress(0)
      setErrorMessage("")

      // Step 1: Get presigned URL
      const presignResponse = await presignMutation.mutateAsync({
        contentId,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size
      })

      // Step 2: Upload file directly to R2
      await axios.put(presignResponse.uploadUrl, file, {
        headers: {
          ...presignResponse.headers,
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percentCompleted)
          }
        }
      })

      // Step 3: Notify upload complete
      await completeMutation.mutateAsync({
        contentId,
        objectKey: presignResponse.objectKey
      })

      // Step 4: Move to processing and wait for polling
      setStep('PROCESSING')
      setProgress(100)

    } catch (error: any) {
      console.error("Upload failed", error)
      setStep('ERROR')
      setErrorMessage(error.response?.data?.message || error.message || "Có lỗi xảy ra trong quá trình upload.")
    }
  }

  const handleCancel = () => {
    // Prevent accidental close during upload/processing
    if (step === 'UPLOADING' || step === 'PROCESSING') {
      if (!window.confirm("Video đang được xử lý. Bạn có chắc chắn muốn hủy?")) {
        return
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" /> 
            Upload Video (Cloudflare R2)
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Tải video lên máy chủ để xử lý và phát trực tuyến.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {step === 'SELECT_FILE' && (
            <div className="space-y-4">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  file ? "border-indigo-300 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="video/*" 
                  className="hidden" 
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <Video className="w-10 h-10 text-indigo-500" />
                    <p className="font-semibold text-slate-800 break-all">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p className="text-xs text-indigo-600 mt-2 font-medium cursor-pointer">Nhấn để chọn file khác</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                      <UploadCloud className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-700">Kéo thả file video hoặc nhấn để chọn</p>
                    <p className="text-xs text-slate-400">Hỗ trợ định dạng MP4, WebM (Tối đa 2GB)</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={handleCancel}>Hủy</Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || presignMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Bắt đầu Upload
                </Button>
              </div>
            </div>
          )}

          {step === 'UPLOADING' && (
            <div className="py-6 space-y-6 flex flex-col items-center text-center">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-indigo-600 transition-all duration-300 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={40 * 2 * Math.PI}
                    strokeDashoffset={40 * 2 * Math.PI - (progress / 100) * 40 * 2 * Math.PI}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-xl font-bold text-slate-800">{progress}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Đang tải lên...</h3>
                <p className="text-sm text-slate-500 max-w-[280px]">
                  Vui lòng không đóng cửa sổ này trong quá trình tải lên. Tốc độ phụ thuộc vào dung lượng file và mạng của bạn.
                </p>
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="py-8 space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center relative">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Đang xử lý video...</h3>
                <p className="text-sm text-slate-500">
                  Video đã tải lên Cloudflare và đang trong quá trình encode. 
                  Quá trình này có thể mất một vài phút.
                </p>
              </div>
              <Progress value={undefined} className="w-full max-w-[200px] h-2 animate-pulse" />
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="py-8 space-y-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Hoàn tất!</h3>
                <p className="text-sm text-slate-500">Video đã được xử lý và sẵn sàng phát.</p>
              </div>
            </div>
          )}

          {step === 'ERROR' && (
            <div className="py-6 space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Upload thất bại</h3>
                <p className="text-sm text-rose-500 font-medium">{errorMessage}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel}>Đóng</Button>
                <Button onClick={() => setStep('SELECT_FILE')} className="bg-indigo-600 text-white">
                  Thử lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
