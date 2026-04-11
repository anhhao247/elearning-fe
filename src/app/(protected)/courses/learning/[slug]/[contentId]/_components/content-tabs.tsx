"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentDetailResponse } from "@/types/learning"

interface ContentTabsProps {
  content: ContentDetailResponse
}

export function ContentTabs({ content }: ContentTabsProps) {
  return (
    <div className="mt-8 mb-20 md:mb-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="overview" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent py-3 px-4 font-semibold"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger 
            value="qa" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent py-3 px-4 font-semibold"
          >
            Hỏi đáp
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent py-3 px-4 font-semibold"
          >
            Tài liệu
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            {content.description ? (
              <p className="whitespace-pre-wrap">{content.description}</p>
            ) : (
              <p className="text-muted-foreground italic">Bài học này không có mô tả chi tiết.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="qa" className="mt-6">
          <div className="text-center p-8 border border-dashed rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Hỏi đáp</h3>
            <p className="text-muted-foreground">Tính năng đang cập nhật...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <div className="text-center p-8 border border-dashed rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Tài liệu đính kèm</h3>
            <p className="text-muted-foreground">Chưa có tài liệu cho bài học này.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
