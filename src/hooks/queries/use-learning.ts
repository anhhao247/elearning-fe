import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getSyllabus, 
  getContentDetail, 
  completeContent, 
  getComments, 
  createComment,
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from '@/lib/services/learning.service'
import { CreateCommentPayload, CreateNotePayload, UpdateNotePayload } from '@/types/learning'

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

// Hooks for Notes
export function useNotes(courseId?: number | string, contentId?: number | string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['notes', courseId, contentId],
    queryFn: () => getNotes(courseId, contentId),
    enabled: enabled,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateNotePayload }) => updateNote(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
