"use client"

import { useState, use, useMemo } from "react"
import Link from "next/link"
import {
  ChevronLeft, Menu, Video, PanelRightClose, PanelRightOpen,
} from "lucide-react"

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

  const courseId = useMemo(() => {
    const parts = slug.split("-")
    const id = Number(parts[parts.length - 1])
    return isNaN(id) ? 0 : id
  }, [slug])

  const { data: syllabus, isLoading: isSyllabusLoading, error: syllabusError } = useSyllabus(courseId, courseId > 0)
  const { data: contentDetail, isLoading: isContentLoading, error: contentError } = useContentDetail(contentId, contentId > 0)

  const progressStats = useMemo(() => {
    if (!syllabus) return { completed: 0, total: 0, percentage: 0 }
    let total = 0, completed = 0
    syllabus.modules.forEach((m) => m.contents.forEach((c) => { total++; if (c.isCompleted) completed++ }))
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [syllabus])

  if (courseId === 0) return <div className="p-8 text-center text-destructive">URL không hợp lệ.</div>

  if (syllabusError || contentError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-destructive min-h-[50vh]">
        <p className="text-lg font-bold">Đã có lỗi xảy ra</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className="h-14 bg-slate-900 text-white flex items-center px-4 gap-3 shrink-0 z-40">
        <Link href={`/courses/${slug}`} className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm font-medium shrink-0">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trở về</span>
        </Link>

        <div className="w-px h-5 bg-slate-700 shrink-0" />

        <h1 className="flex-1 text-white text-sm font-semibold line-clamp-1">
          {isContentLoading ? <Skeleton className="h-4 w-48 bg-slate-700" /> : contentDetail?.title}
        </h1>

        {/* Progress */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1.5">
            <div className="relative w-5 h-5 shrink-0">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
                <circle
                  cx="10" cy="10" r="8" fill="none" stroke="#818cf8"
                  strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 8}`}
                  strokeDashoffset={`${2 * Math.PI * 8 * (1 - progressStats.percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
            </div>
            {isSyllabusLoading ? (
              <Skeleton className="h-3 w-16 bg-slate-700" />
            ) : (
              <span className="text-slate-300 text-xs font-medium">
                {progressStats.completed}/{progressStats.total} bài · {progressStats.percentage}%
              </span>
            )}
          </div>
        </div>

        {/* AI Interview */}
        <Link href={`/courses/learning/${slug}/${contentId}/interview`} className="shrink-0">
          <Button variant="secondary" size="sm" className="hidden md:flex gap-2 text-primary bg-slate-800 hover:bg-slate-700 border-0 text-xs rounded-lg">
            <Video className="w-3.5 h-3.5" />
            Vấn đáp AI
          </Button>
        </Link>

        {/* Toggle sidebar */}
        <Button
          variant="ghost" size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
          title={isSidebarOpen ? "Ẩn nội dung" : "Hiện nội dung"}
        >
          {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </Button>

        {/* Mobile menu */}
        <div className="lg:hidden shrink-0">
          {syllabus && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[320px] sm:w-[380px]">
                <SyllabusSidebar syllabus={syllabus} currentContentId={contentId} courseSlug={slug} />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-background">
          <div className={cn(
            "mx-auto px-4 sm:px-6 lg:px-10 py-8 transition-all duration-300",
            isSidebarOpen ? "max-w-4xl" : "max-w-5xl"
          )}>
            {isContentLoading || !contentDetail ? (
              <div className="space-y-5">
                <Skeleton className="w-full aspect-video rounded-2xl" />
                <Skeleton className="h-7 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded-lg" />
              </div>
            ) : (
              <>
                <ContentPlayer content={contentDetail} courseId={courseId} />
                <div className="mt-6">
                  <ContentTabs content={contentDetail} />
                </div>
              </>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className={cn(
          "hidden lg:flex flex-col shrink-0 border-l bg-card overflow-hidden sticky top-0 h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-[340px] xl:w-[380px] opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}>
          <div className="min-w-[340px] xl:min-w-[380px] h-full overflow-y-auto">
            {isSyllabusLoading || !syllabus ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-1/2 rounded" />
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <SyllabusSidebar syllabus={syllabus} currentContentId={contentId} courseSlug={slug} />
            )}
          </div>
        </aside>
      </div>

      {/* Notes — offset lên để không đè chatbot */}
      <NotesPanel courseId={courseId} contentId={contentId} />
    </div>
  )
}
