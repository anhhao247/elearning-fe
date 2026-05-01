"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, PlayCircle, BookOpenText, HelpCircle } from "lucide-react"
import { SyllabusResponse, LearningContentItem } from "@/types/learning"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface SyllabusSidebarProps {
  syllabus: SyllabusResponse
  currentContentId: number
  courseSlug: string
}

export function SyllabusSidebar({ syllabus, currentContentId, courseSlug }: SyllabusSidebarProps) {
  const router = useRouter()

  const defaultExpandedModuleIds = useMemo(() =>
    syllabus.modules.filter(m => m.contents.some(c => c.id === currentContentId)).map(m => `module-${m.id}`)
  , [syllabus, currentContentId])

  const totalCompleted = syllabus.modules.reduce((acc, m) => acc + m.contents.filter(c => c.isCompleted).length, 0)
  const totalLessons = syllabus.modules.reduce((acc, m) => acc + m.contents.length, 0)
  const pct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  const typeInfo = (t: LearningContentItem["contentType"]) => {
    switch (t) {
      case "VIDEO":   return { label: "Video",       icon: <PlayCircle   className="w-3.5 h-3.5" /> }
      case "READING": return { label: "Bài đọc",     icon: <BookOpenText className="w-3.5 h-3.5" /> }
      case "QUIZ":    return { label: "Trắc nghiệm", icon: <HelpCircle   className="w-3.5 h-3.5" /> }
      default:        return { label: "Bài học",     icon: <BookOpenText className="w-3.5 h-3.5" /> }
    }
  }

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b space-y-3 bg-muted/30 shrink-0">
        <h2 className="font-bold text-base">Nội dung khóa học</h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hoàn thành {totalCompleted}/{totalLessons} bài</span>
            <span className="text-primary font-semibold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={defaultExpandedModuleIds} className="w-full">
          {syllabus.modules.map((module) => {
            const modCompleted = module.contents.filter(c => c.isCompleted).length
            return (
              <AccordionItem key={module.id} value={`module-${module.id}`} className="border-b-0 border-t">
                <AccordionTrigger className="px-5 py-3.5 hover:bg-muted/50 bg-muted/20 text-sm font-semibold sticky top-0 bg-card/95 backdrop-blur z-10 data-[state=open]:border-b">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="line-clamp-2 leading-snug">{module.title}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {modCompleted}/{module.contents.length} bài
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-0">
                  <ul className="flex flex-col">
                    {module.contents.map((content) => {
                      const isActive = content.id === currentContentId
                      const info = typeInfo(content.contentType)
                      return (
                        <li key={content.id}>
                          <button
                            onClick={() => router.push(`/courses/learning/${courseSlug}/${content.id}`)}
                            className={cn(
                              "w-full flex items-start text-left px-5 py-3 gap-3 border-l-2 transition-all duration-150",
                              isActive
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:bg-muted/40 hover:border-muted"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">
                              {content.isCompleted
                                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                : <Circle className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                              }
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className={cn(
                                "text-sm line-clamp-2 leading-snug",
                                isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                              )}>
                                {content.title}
                              </p>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                {info.icon}<span>{info.label}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                    {module.contents.length === 0 && (
                      <li className="px-5 py-4 text-sm text-muted-foreground text-center italic">Chưa có nội dung</li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
