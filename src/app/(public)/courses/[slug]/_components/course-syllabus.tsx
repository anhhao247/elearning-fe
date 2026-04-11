"use client"

import { CourseModule } from "@/types/course"
import { PlayCircle, FileText, HelpCircle, CheckCircle2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface CourseSyllabusProps {
  modules: CourseModule[]
}

export function CourseSyllabus({ modules }: CourseSyllabusProps) {
  if (!modules || modules.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="w-4 h-4 text-primary" />
      case "READING":
        return <FileText className="w-4 h-4 text-emerald-500" />
      case "QUIZ":
        return <HelpCircle className="w-4 h-4 text-orange-500" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <section className="space-y-6 bg-card rounded-xl p-6 shadow-sm border border-border/50">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nội dung khóa học</h2>
        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-4 items-center">
          <span>{modules.length} modules</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{modules.reduce((acc, m) => acc + (m.lessonCount || 0), 0)} bài giảng</span>
        </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {modules.map((module) => (
          <AccordionItem
            key={module.id}
            value={module.id.toString()}
            className="border rounded-lg px-4 bg-muted/30"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-2">
                <span className="font-semibold text-base text-left">{module.title}</span>
                <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                  {module.lessonCount} bài giảng
                </span>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {module.contents && module.contents.length > 0 ? (
                module.contents.map((content) => (
                  <div
                    key={content.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <div className="mt-1 md:mt-0">{getIcon(content.contentType)}</div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{content.title}</p>
                        {content.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{content.description}</p>
                        )}
                      </div>
                    </div>
                    {content.videoDuration !== null && content.videoDuration !== undefined && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap md:self-center ml-7 md:ml-0">
                        {content.videoDuration} phút
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic px-3 py-2">
                  Chưa có nội dung cho phần này.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
