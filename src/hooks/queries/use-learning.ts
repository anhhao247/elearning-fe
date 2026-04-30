import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getSyllabus, 
  getContentDetail, 
  completeContent, 
  getComments, 
  createComment 
} from '@/lib/services/learning.service'
import { CreateCommentPayload } from '@/types/learning'

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

export function useCompleteContent(courseId: number | string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (contentId: number | string) => completeContent(contentId),
    onSuccess: (data) => {
      // Invalidate both the syllabus (for progress counts) and the specific content detail
      queryClient.invalidateQueries({ queryKey: ['syllabus', courseId] })
      queryClient.invalidateQueries({ queryKey: ['content', data.contentId] })
    },
  })
}

export function useComments(contentId: number | string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['comments', contentId],
    queryFn: () => getComments(contentId),
    enabled: !!contentId && enabled,
  })
}

export function useCreateComment(contentId: number | string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => createComment(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentId] })
    },
  })
}
