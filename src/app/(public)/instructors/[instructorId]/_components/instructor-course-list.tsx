import Link from "next/link"
import { InstructorPublicCourse } from "@/types/instructor"
import { CourseCard } from "@/components/features/courses/course-card"
import { ChevronRight } from "lucide-react"

interface InstructorCourseListProps {
  courses: InstructorPublicCourse[]
}

export function InstructorCourseList({ courses }: InstructorCourseListProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Courses by this Instructor
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl">
            Master professional software engineering with industry-vetted curriculums.
          </p>
        </div>
        <Link 
          href="/courses" 
          className="inline-flex items-center text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors group"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">Giảng viên này chưa có khóa học công khai nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={{
                ...course,
                instructorName: "", // We are on the instructor profile, so this is fine or we can pass the name if available
                avgRating: 0, // Mocking these as they are not in the current API response
                totalReviews: 0,
              } as any} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
