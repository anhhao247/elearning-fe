import { useQuery } from '@tanstack/react-query'
import { getSyllabus, getContentDetail } from '@/lib/services/learning.service'

export function useSyllabus(courseId: number | string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['syllabus', courseId],
    queryFn: () => getSyllabus(courseId),
    enabled: !!courseId && enabled,
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}

export function useContentDetail(contentId: number | string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['content', contentId],
    queryFn: () => getContentDetail(contentId),
    enabled: !!contentId && enabled,
    staleTime: 60 * 1000 * 5, // 5 minutes
  })
}
