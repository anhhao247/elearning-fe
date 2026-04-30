"use client"

import { useState, use, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, Menu, Video, List, PanelRightClose, PanelRightOpen } from "lucide-react"

import { useSyllabus, useContentDetail } from "@/hooks/queries/use-learning"
import { SyllabusSidebar } from "./_components/syllabus-sidebar"
import { ContentPlayer } from "./_components/content-player"
import { ContentTabs } from "./_components/content-tabs"
import { NotesPanel } from "./_components/notes-panel"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function LearningPage({
  params,
}: {
  params: Promise<{ slug: string; contentId: string }>
}) {
  const unwrappedParams = use(params)
  const { slug, contentId: contentIdStr } = unwrappedParams
  
  const contentId = Number(contentIdStr)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Extract courseId from the end of the slug (e.g., react-course-12 -> 12)
  const courseId = useMemo(() => {
    const parts = slug.split("-")
    const id = Number(parts[parts.length - 1])
    return isNaN(id) ? 0 : id
  }, [slug])

  const { 
    data: syllabus, 
    isLoading: isSyllabusLoading,
    error: syllabusError 
  } = useSyllabus(courseId, courseId > 0)

  const { 
    data: contentDetail, 
    isLoading: isContentLoading,
    error: contentError 
  } = useContentDetail(contentId, contentId > 0)

  // Calculate real progress
  const progressStats = useMemo(() => {
    if (!syllabus) return { completed: 0, total: 0, percentage: 0 }
    
    let total = 0
    let completed = 0
    
    syllabus.modules.forEach(module => {
      module.contents.forEach(content => {
        total++
        if (content.isCompleted) completed++
      })
    })
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }, [syllabus])

  if (courseId === 0) {
    return <div className="p-8 text-center text-destructive">URL không hợp lệ. Không tìm thấy ID khóa học.</div>
  }

  // Handle errors
  if (syllabusError || contentError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-destructive min-h-[50vh]">
        <p className="text-lg font-bold">Đã có lỗi xảy ra</p>
        <p className="mt-2 text-sm max-w-md">
          {syllabusError?.message || contentError?.message || "Không thể tải nội dung bài học. Vui lòng thử lại sau."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fake Top Bar */}
      <div className="h-14 bg-slate-900 text-white flex items-center px-4 justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${slug}`} className="hover:text-primary transition-colors flex items-center">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline text-sm font-medium">Trở về khóa học</span>
          </Link>
          <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>
          <h1 className="font-semibold text-sm md:text-base line-clamp-1 max-w-[300px] md:max-w-xl">
            {isContentLoading ? <Skeleton className="h-5 w-40 bg-slate-700" /> : contentDetail?.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href={`/courses/learning/${slug}/${contentId}/interview`}>
            <Button variant="secondary" size="sm" className="hidden md:flex gap-2 text-primary">
              <Video className="w-4 h-4" />
              Vấn đáp với AI
            </Button>
          </Link>
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <div 
              className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent flex items-center justify-center text-[10px] font-bold"
              style={{ 
                borderTopColor: progressStats.percentage === 100 ? 'currentColor' : 'transparent',
                transform: `rotate(${progressStats.percentage * 3.6}deg)` 
              }}
            >
              <span style={{ transform: `rotate(-${progressStats.percentage * 3.6}deg)` }}>
                {progressStats.percentage}%
              </span>
            </div>
            {isSyllabusLoading ? (
              <Skeleton className="h-4 w-20 bg-slate-700" />
            ) : (
              <span className="text-slate-300">
                {progressStats.completed} / {progressStats.total} bài
              </span>
            )}
          </div>

          {/* Toggle Sidebar Button Desktop */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex text-white hover:bg-slate-800 gap-2 border border-slate-700"
          >
            {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span className="text-xs">{isSidebarOpen ? "Ẩn nội dung" : "Hiện nội dung"}</span>
          </Button>
          
          {/* Mobile Menu Trigger for Syllabus */}
          <div className="lg:hidden">
            {syllabus && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[320px] sm:w-[400px]">
                  <SyllabusSidebar 
                    syllabus={syllabus} 
                    currentContentId={contentId} 
                    courseSlug={slug}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ease-in-out">
          <div className={cn(
            "w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-full transition-all duration-300",
            isSidebarOpen ? "max-w-5xl" : "max-w-6xl"
          )}>
            {isContentLoading || !contentDetail ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-8 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <ContentPlayer content={contentDetail} courseId={courseId} />
                <ContentTabs content={contentDetail} />
              </>
            )}
          </div>
        </div>

        {/* Right Side: Syllabus Sidebar */}
        <div className={cn(
          "hidden lg:block shrink-0 border-l bg-card overflow-y-auto z-10 sticky top-0 h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-[360px] xl:w-[400px] opacity-100" : "w-0 opacity-0 border-none overflow-hidden"
        )}>
          <div className="min-w-[360px] xl:min-w-[400px]">
            {isSyllabusLoading || !syllabus ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-1/2 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <SyllabusSidebar 
                syllabus={syllabus} 
                currentContentId={contentId} 
                courseSlug={slug}
              />
            )}
          </div>
        </div>
      </div>

      {/* Ghi chú cá nhân (NotebookLM style) */}
      <NotesPanel courseId={courseId} contentId={contentId} />

    </div>
  )
}
