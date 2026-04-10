"use client"

import { useEffect, useState } from "react"
import ReactPlayer from "react-player"
import { ContentDetailResponse } from "@/types/learning"

interface ContentPlayerProps {
  content: ContentDetailResponse
}

export function ContentPlayer({ content }: ContentPlayerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="aspect-video bg-muted animate-pulse rounded-lg flex items-center justify-center">Đang tải...</div>
  }

  const renderContent = () => {
    if (content.contentType === "VIDEO" && content.videoDetails?.platform === "YOUTUBE") {
      const videoUrl = `https://www.youtube.com/watch?v=${content.videoDetails.platformVideoId}`
      // Bỏ qua cảnh báo type do ReactPlayer chưa hỗ trợ hoàn toàn Next.js 15/React 19 types
      const Player = ReactPlayer as any
      return (
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <Player
              url={videoUrl}
              width="100%"
              height="100%"
              controls
              playing={false}
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
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl md:text-3xl font-bold">{content.title}</h1>
          <div className="p-8 text-center bg-card border rounded-lg min-h-[400px] flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-xl font-bold mb-2">Bài tập trắc nghiệm</h3>
            <p className="text-muted-foreground mb-4">Hoàn thành bài tập đánh giá để tiếp tục phần học tiếp theo.</p>
            <button className="px-6 py-2.5 font-medium bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors">Bắt đầu Quiz</button>
          </div>
        </div>
      )
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
    <div className="w-full">
      {renderContent()}
    </div>
  )
}
