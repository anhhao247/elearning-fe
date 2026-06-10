"use client"

import { CourseModule } from "@/types/course"
import { PlayCircle, FileText, HelpCircle, BookOpen, Layers, Timer } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface CourseSyllabusProps {
  modules: CourseModule[]
  totalDuration?: string
  totalLessons?: number
  totalChapters?: number
}

export function CourseSyllabus({ modules, totalDuration, totalLessons, totalChapters }: CourseSyllabusProps) {
  if (!modules || modules.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="w-4 h-4 text-primary shrink-0" />
      case "READING":
        return <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
      case "QUIZ":
        return <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0p"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}h${m > 0 ? `${m}p` : ""}`
    }
    if (m > 0) {
      return `${m}p`
    }
    return `${s}s`
  }

  const chapterCount = totalChapters ?? modules.length
  const lessonCount = totalLessons ?? modules.reduce((acc, m) => acc + (m.lessonCount || 0), 0)

  return (
    <section className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-border/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Chương trình học</h2>
            <p className="text-sm text-muted-foreground">Lộ trình học đầy đủ cho khóa học này</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x divide-border/50 bg-muted/20 border-b border-border/50">
        <div className="flex flex-col items-center justify-center py-4 px-2 gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            CHAPTERS
          </div>
          <span className="text-2xl font-black text-foreground">{chapterCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-4 px-2 gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            LESSONS
          </div>
          <span className="text-2xl font-black text-foreground">{lessonCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-4 px-2 gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            DURATION
          </div>
          <span className="text-2xl font-black text-foreground">
            {totalDuration && totalDuration !== "0m" ? totalDuration : "—"}
          </span>
        </div>
      </div>

      {/* Accordion */}
      <div className="p-4 md:p-6">
        <Accordion type="multiple" className="w-full space-y-2">
          {modules.map((module, idx) => (
            <AccordionItem
              key={module.id}
              value={module.id.toString()}
              className="border border-border/50 rounded-lg overflow-hidden bg-background"
            >
              <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between w-full pr-4 gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm">{module.title}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
                    {module.lessonCount} bài giảng
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="border-t border-border/30 bg-muted/10">
                <div className="divide-y divide-border/20">
                  {module.contents && module.contents.length > 0 ? (
                    module.contents.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getIcon(content.contentType)}
                          <p className="text-sm font-medium text-foreground truncate">{content.title}</p>
                        </div>
                        {content.videoDuration !== null && content.videoDuration !== undefined && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {formatDuration(content.videoDuration)}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic px-5 py-3">
                      Chưa có nội dung cho phần này.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
