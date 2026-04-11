"use client"

import Link from "next/link"
import Image from "next/image"
import { MyCourse } from "@/types/course"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateSlug } from "@/lib/utils"
import { BookOpen } from "lucide-react"

function getLevelBadgeVariant(level: string) {
  switch (level) {
    case "BEGINNER":
      return "default"
    case "INTERMEDIATE":
      return "secondary"
    case "ADVANCED":
      return "destructive"
    default:
      return "outline"
  }
}

export function MyCourseCard({ course }: { course: MyCourse }) {
  const isCompleted = course.progress === 100

  return (
    <Link href={`/courses/${generateSlug(course.title, course.id)}`}>
      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 bg-card">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/20 text-muted-foreground/50">
              <BookOpen className="h-12 w-12 opacity-30" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-primary text-primary-foreground border-none font-bold uppercase tracking-wider text-[10px]">Đã hoàn thành</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={getLevelBadgeVariant(course.level)} className="text-[10px] uppercase font-bold tracking-wider">
              {course.level}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">Khóa học của tôi</span>
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors duration-300 font-bold">
            {course.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 mt-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
              <span className="text-muted-foreground">Tiến độ học tập</span>
              <span className="text-primary">{Math.round(course.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-primary' : 'bg-primary/80'}`} 
                style={{ width: `${course.progress}%` }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
