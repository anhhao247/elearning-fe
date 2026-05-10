"use client"

import { useEffect, useState } from "react"
import { ContentDetailResponse } from "@/types/learning"
import { CompleteLessonButton } from "./complete-lesson-button"
import { QuizPlayer } from "./quiz-player"
import { PlayCircle, BookOpenText, HelpCircle } from "lucide-react"
import "react-quill-new/dist/quill.snow.css" // Import quill css for proper rendering if needed

interface ContentPlayerProps {
  content: ContentDetailResponse
  courseId: number
}

export function ContentPlayer({ content, courseId }: ContentPlayerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="aspect-video bg-muted animate-pulse rounded-2xl" />
    )
  }

  const typeMap = {
    VIDEO: { label: "Video", icon: <PlayCircle className="w-3.5 h-3.5" />, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    READING: { label: "Bài đọc", icon: <BookOpenText className="w-3.5 h-3.5" />, color: "bg-amber-50 text-amber-600 border-amber-200" },
    QUIZ: { label: "Trắc nghiệm", icon: <HelpCircle className="w-3.5 h-3.5" />, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  }
  const typeInfo = typeMap[content.contentType] ?? typeMap["READING"]

  const renderContent = () => {
    /* ── VIDEO ── */
    if (content.contentType === "VIDEO" && content.videoDetails?.platform === "YOUTUBE") {
      const videoId =
        content.videoDetails.videoId || (content.videoDetails as any).platformVideoId

      if (!videoId) {
        return (
          <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center border">
            <p className="text-muted-foreground text-sm">Không tìm thấy mã video YouTube.</p>
          </div>
        )
      }

      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
            title={content.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )
    }

    /* ── READING ── */
    if (content.contentType === "READING") {
      return (
        <div className="w-full flex justify-center lg:justify-start">
          <div
            className="prose prose-sm md:prose-base max-w-[65ch] w-full ql-editor px-0 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html:
                content.readingDetails?.body ||
                content.description ||
                "Nội dung bài đọc đang được cập nhật...",
            }}
          />
        </div>
      )
    }

    /* ── QUIZ ── */
    if (content.contentType === "QUIZ") {
      return <QuizPlayer contentId={content.id} title={content.title} />
    }

    return (
      <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center border border-dashed">
        <p className="text-muted-foreground">Loại nội dung không được hỗ trợ.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5">
      {/* Content renderer */}
      {renderContent()}

      {/* Title + meta + action */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-2 flex-1 min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${typeInfo.color}`}>
            {typeInfo.icon}
            {typeInfo.label}
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-snug text-foreground">
            {content.title}
          </h1>
        </div>

        <div className="shrink-0 pt-1">
          <CompleteLessonButton
            contentId={content.id}
            courseId={courseId}
            isCompleted={content.isCompleted || false}
          />
        </div>
      </div>
    </div>
  )
}
