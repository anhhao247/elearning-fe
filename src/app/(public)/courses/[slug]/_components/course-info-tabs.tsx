"use client"

import { CourseDetail } from "@/types/course"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Target, Lightbulb, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react"

interface CourseInfoTabsProps {
  course: CourseDetail
}

export function CourseInfoTabs({ course }: CourseInfoTabsProps) {
  return (
    <div className="w-full bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab List */}
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-4 sm:gap-6 md:gap-8 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { value: "overview", label: "Overview", icon: <BookOpen className="w-4 h-4" /> },
            { value: "requirements", label: "Requirements", icon: <ClipboardList className="w-4 h-4" /> },
            { value: "benefits", label: "Benefits", icon: <Target className="w-4 h-4" /> },
            { value: "technique", label: "Techniques", icon: <Lightbulb className="w-4 h-4" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-full px-4 py-3 flex items-center gap-2 rounded-none font-normal text-sm text-muted-foreground transition-all border-0
                data-[state=active]:font-medium data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary 
                data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none focus-visible:ring-0"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Panels */}
        <div className="p-6 md:p-8">
          {/* Overview */}
          <TabsContent value="overview" className="mt-0 focus-visible:outline-none animate-in fade-in-30 duration-200">
            <h3 className="text-section-title mb-5">Overview</h3>
            <div
              className="text-body leading-relaxed text-[15px] prose prose-sm dark:prose-invert max-w-none break-words text-justify"
              dangerouslySetInnerHTML={{
                __html: course.overview || course.description || "Chưa có thông tin tổng quan cho khóa học này."
              }}
            />
          </TabsContent>

          {/* Requirements */}
          <TabsContent value="requirements" className="mt-0 focus-visible:outline-none animate-in fade-in-30 duration-200">
            <h3 className="text-section-title mb-5">Requirements</h3>
            {course.requirements && course.requirements.length > 0 ? (
              <ul className="space-y-3">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-body text-[15px] leading-relaxed break-words min-w-0">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 p-5 rounded-xl bg-muted/20 text-muted-foreground">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Không có yêu cầu cụ thể nào cho khóa học này.</p>
              </div>
            )}
          </TabsContent>

          {/* Benefits */}
          <TabsContent value="benefits" className="mt-0 focus-visible:outline-none animate-in fade-in-30 duration-200">
            <h3 className="text-section-title mb-5">Benefits</h3>
            {course.benefits && course.benefits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/30 hover:border-primary/20 transition-all group"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-body font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed break-words min-w-0">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 rounded-xl bg-muted/20 text-muted-foreground">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Chưa có thông tin lợi ích cho khóa học này.</p>
              </div>
            )}
          </TabsContent>

          {/* Techniques */}
          <TabsContent value="technique" className="mt-0 focus-visible:outline-none animate-in fade-in-30 duration-200">
            <h3 className="text-section-title mb-5">Techniques & Skills</h3>
            {course.technique && course.technique.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {course.technique.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/15 hover:border-primary/30 rounded-xl transition-all cursor-default"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-semibold text-sm">{tech}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 rounded-xl bg-muted/20 text-muted-foreground">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Chưa có kỹ thuật cụ thể cho khóa học này.</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
