import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCourse,
  createModule,
  createContent,
  updateContentDetails,
  getCategories,
  CreateCoursePayload,
  CreateModulePayload,
  CreateContentPayload,
  ContentDetailsPayload,
} from '@/lib/services/instructor.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateCourse() {
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
  })
}

export function useCreateModule() {
  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: number; payload: CreateModulePayload }) =>
      createModule(courseId, payload),
  })
}

export function useCreateContent() {
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: number; payload: CreateContentPayload }) =>
      createContent(moduleId, payload),
  })
}

export function useUpdateContentDetails() {
  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: number
      payload: ContentDetailsPayload
    }) => updateContentDetails(contentId, payload),
  })
}
