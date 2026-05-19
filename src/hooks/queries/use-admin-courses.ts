import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCourseSubmissions,
  approveCourse,
  rejectCourse,
  getCourseForReview
} from '@/lib/services/admin-course.service'

export function useAdminCourseSubmissions(page: number, size: number, status?: string) {
  return useQuery({
    queryKey: ['admin-course-submissions', page, size, status],
    queryFn: () => getCourseSubmissions(page, size, status),
  })
}

export function useAdminCourseDetail(courseId: number) {
  return useQuery({
    queryKey: ['admin-course-detail', courseId],
    queryFn: () => getCourseForReview(courseId),
    enabled: !!courseId,
  })
}

export function useApproveCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: number) => approveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-submissions'] })
    },
  })
}

export function useRejectCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, reason }: { courseId: number, reason: string }) => rejectCourse(courseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-submissions'] })
    },
  })
}
