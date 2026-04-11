"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Circle, PlaySquare, BookOpen, HelpCircle } from "lucide-react"

import { SyllabusResponse, LearningContentItem } from "@/types/learning"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface SyllabusSidebarProps {
  syllabus: SyllabusResponse
  currentContentId: number
  courseSlug: string
}

export function SyllabusSidebar({ syllabus, currentContentId, courseSlug }: SyllabusSidebarProps) {
  const router = useRouter()

  // Find which module contains the current content to expand it by default
  const defaultExpandedModuleIds = useMemo(() => {
    const modulesWithCurrentContent = syllabus.modules.filter(m => 
      m.contents.some(c => c.id === currentContentId)
    )
    return modulesWithCurrentContent.map(m => `module-${m.id}`)
  }, [syllabus, currentContentId])

  const getContentIcon = (type: LearningContentItem["contentType"]) => {
    switch (type) {
      case "VIDEO":
        return <PlaySquare className="w-4 h-4 text-muted-foreground mr-2" />
      case "READING":
        return <BookOpen className="w-4 h-4 text-muted-foreground mr-2" />
      case "QUIZ":
        return <HelpCircle className="w-4 h-4 text-muted-foreground mr-2" />
      default:
        return <BookOpen className="w-4 h-4 text-muted-foreground mr-2" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l overflow-hidden">
      <div className="p-4 border-b bg-muted/40">
        <h2 className="font-bold text-lg">Nội dung khóa học</h2>
        <div className="text-sm text-muted-foreground mt-1">
          {/* Mock progress, can calculate from syllabus if needed */}
          Hoàn thành 0 / {syllabus.modules.reduce((acc, m) => acc + m.contents.length, 0)} bài học
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion 
          type="multiple" 
          defaultValue={defaultExpandedModuleIds}
          className="w-full"
        >
          {syllabus.modules.map((module) => (
            <AccordionItem key={module.id} value={`module-${module.id}`} className="border-b-0 border-t">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 bg-muted/10 text-sm font-semibold sticky top-0 bg-background/95 backdrop-blur z-10 data-[state=open]:border-b">
                <div className="flex flex-col items-start gap-1 text-left">
                  <span>{module.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    0/{module.contents.length} bài học
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="flex flex-col">
                  {module.contents.map((content) => {
                    const isActive = content.id === currentContentId
                    return (
                      <li key={content.id}>
                        <button
                          onClick={() => router.push(`/courses/learning/${courseSlug}/${content.id}`)}
                          className={cn(
                            "w-full flex items-start text-left px-4 py-3 hover:bg-muted transition-colors gap-3",
                            isActive ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            {content.isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-sm mb-1 line-clamp-2",
                              isActive ? "font-bold text-foreground" : "text-muted-foreground"
                            )}>
                              {content.title}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {getContentIcon(content.contentType)}
                              <span>{content.contentType === "VIDEO" ? "Video" : content.contentType === "READING" ? "Bài đọc" : "Trắc nghiệm"}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                  {module.contents.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground text-center italic">
                      Chưa có nội dung
                    </li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
