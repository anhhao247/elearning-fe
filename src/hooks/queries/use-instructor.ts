import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCourse,
  createModule,
  createContent,
  updateContentDetails,
  getCategories,
  getCourseById,
  getCourseSyllabus,
  updateModule,
  deleteModule,
  updateContent,
  deleteContent,
  CreateCoursePayload,
  CreateModulePayload,
  CreateContentPayload,
  ContentDetailsPayload,
  InstructorCourse,
  getInstructorCourses,
  updateCourse,
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

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['instructor-course', id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  })
}

export function useCourseOutline(id: number | string) {
  return useQuery({
    queryKey: ['instructor-course-outline', id],
    queryFn: () => getCourseSyllabus(id),
    enabled: !!id,
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: number; payload: Partial<CreateModulePayload> }) =>
      updateModule(moduleId, payload),
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course'] })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (moduleId: number) => deleteModule(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course'] })
    },
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contentId, payload }: { contentId: number; payload: Partial<CreateContentPayload> }) =>
      updateContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course'] })
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contentId: number) => deleteContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course'] })
    },
  })
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: CreateCoursePayload }) =>
      updateCourse(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course-outline', id] })
    },
  })
}
