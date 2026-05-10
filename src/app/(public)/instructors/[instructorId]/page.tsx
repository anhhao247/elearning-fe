"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getInstructorProfile, getInstructorPublicCourses } from "@/lib/services/instructor.service"
import { InstructorHero } from "./_components/instructor-hero"
import { InstructorBio } from "./_components/instructor-bio"
import { InstructorCourseList } from "./_components/instructor-course-list"
import { Loader2 } from "lucide-react"

export default function InstructorProfilePage() {
  const params = useParams()
  const instructorId = params?.instructorId as string

  const { 
    data: profile, 
    isLoading: isLoadingProfile, 
    isError: isErrorProfile 
  } = useQuery({
    queryKey: ["instructorProfile", instructorId],
    queryFn: () => getInstructorProfile(instructorId),
    enabled: !!instructorId,
  })

  const { 
    data: courses, 
    isLoading: isLoadingCourses,
    isError: isErrorCourses 
  } = useQuery({
    queryKey: ["instructorCourses", instructorId],
    queryFn: () => getInstructorPublicCourses(instructorId),
    enabled: !!instructorId,
  })

  if (isLoadingProfile || isLoadingCourses) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang tải hồ sơ giảng viên...</p>
      </div>
    )
  }

  if (isErrorProfile || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-destructive">Lỗi khi tải hồ sơ giảng viên</p>
        <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
      </div>
    )
  }

  return (
    <main className="bg-[#f8fafc] min-h-screen">
      {/* Hero section */}
      <InstructorHero 
        profile={profile} 
      />

      {/* Main content */}
      <div className="page-container py-12 lg:py-16 space-y-16">
        {/* Bio & Sidebar Stats */}
        <InstructorBio profile={profile} />
        
        {/* Course List */}
        <InstructorCourseList courses={courses || []} />
      </div>
    </main>
  )
}
