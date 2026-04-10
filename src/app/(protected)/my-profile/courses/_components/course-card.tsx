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
      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-border/50">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
              <BookOpen className="h-12 w-12 opacity-50" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Hoàn thành</Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-4 pb-2">
          <div className="mb-2">
            <Badge variant={getLevelBadgeVariant(course.level)} className="text-xs font-medium">
              {course.level}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 mt-auto">
          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Đã học</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${course.progress}%` }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
