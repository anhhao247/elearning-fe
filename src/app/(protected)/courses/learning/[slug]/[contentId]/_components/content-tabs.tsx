"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentDetailResponse } from "@/types/learning"
import { CommentSection } from "./comment-section"
import { FileText, MessageSquare, BookText } from "lucide-react"

interface ContentTabsProps {
  content: ContentDetailResponse
}

export function ContentTabs({ content }: ContentTabsProps) {
  return (
    <div className="mt-2 mb-16 md:mb-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-1">
          {[
            { value: "overview", label: "Tổng quan", icon: <BookText className="w-3.5 h-3.5" /> },
            { value: "qa", label: "Hỏi đáp", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { value: "resources", label: "Tài liệu", icon: <FileText className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                flex items-center gap-1.5 rounded-none border-b-2 border-transparent
                py-3 px-4 text-sm font-medium text-muted-foreground
                data-[state=active]:border-primary
                data-[state=active]:text-foreground
                data-[state=active]:bg-transparent
                data-[state=active]:shadow-none
                hover:text-foreground
                transition-colors
              "
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div
            className="
              prose prose-sm md:prose-base max-w-none
              prose-p:text-muted-foreground prose-headings:text-foreground
              prose-li:text-muted-foreground prose-a:text-primary
            "
          >
            {content.description ? (
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{content.description}</p>
            ) : (
              <p className="text-muted-foreground italic">Bài học này không có mô tả chi tiết.</p>
            )}
          </div>
        </TabsContent>

        {/* Q&A */}
        <TabsContent value="qa" className="mt-6">
          <CommentSection contentId={content.id} />
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed rounded-2xl">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Chưa có tài liệu đính kèm cho bài học này.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
