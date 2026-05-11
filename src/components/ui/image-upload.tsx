"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
}

const CLOUD_NAME = "dvthznxew"
const UPLOAD_PRESET = "elearning_fe"

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh")
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      console.log("[ImageUpload] Cloudinary response:", data)
      onChange(data.secure_url)
      toast.success("Tải ảnh lên thành công!")
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      toast.error("Lỗi khi tải ảnh lên Cloudinary")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-all group">
            <Image
              fill
              src={value}
              alt="Thumbnail preview"
              className="object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault()
                onRemove()
              }}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={cn(
              "w-40 h-24 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-black hover:bg-slate-50 transition-all text-slate-400 hover:text-black",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            ) : (
              <>
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Tải ảnh lên</span>
              </>
            )}
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-700">Ảnh bìa khóa học</p>
          <p className="text-[10px] text-slate-500 mt-1">Định dạng JPG, PNG. Tối đa 5MB.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-[10px] uppercase font-bold"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {value ? "Thay đổi ảnh" : "Chọn tệp"}
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  )
}
