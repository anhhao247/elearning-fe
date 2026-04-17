"use client"

import { useEffect, useState } from "react"
import ReactPlayer from "react-player"
import { ContentDetailResponse } from "@/types/learning"

import { CompleteLessonButton } from "./complete-lesson-button"
import { QuizPlayer } from "./quiz-player"

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
    return <div className="aspect-video bg-muted animate-pulse rounded-lg flex items-center justify-center">Đang tải...</div>
  }

  const renderContent = () => {
    if (content.contentType === "VIDEO" && content.videoDetails?.platform === "YOUTUBE") {
      const videoId = content.videoDetails.videoId || (content.videoDetails as any).platformVideoId
      
      if (!videoId) {
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
            <p className="text-muted-foreground">Không tìm thấy mã video YouTube.</p>
          </div>
        )
      }

      return (
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">{content.title}</h1>
        </div>
      )
    }

    if (content.contentType === "READING") {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl md:text-3xl font-bold">{content.title}</h1>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none p-6 md:p-8 bg-card border rounded-lg min-h-[400px] shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: content.readingDetails?.body || content.description || "Nội dung bài đọc..." }} />
          </div>
        </div>
      )
    }

    if (content.contentType === "QUIZ") {
      return <QuizPlayer contentId={content.id} title={content.title} />
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-dashed">
          <p className="text-muted-foreground">Loại nội dung không được hỗ trợ.</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">{content.title}</h1>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {renderContent()}
      
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <CompleteLessonButton 
          contentId={content.id}
          courseId={courseId}
          isCompleted={content.isCompleted || false}
        />
      </div>
    </div>
  )
}
