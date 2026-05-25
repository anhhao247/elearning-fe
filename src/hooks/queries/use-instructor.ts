import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCourse,
  createModule,
  createContent,
  updateContentDetails,
  getCategories,
  getCourseById,
  getCourseSyllabus,
  getContentById,
  updateModule,
  deleteModule,
  updateContent,
  deleteContent,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  CreateCoursePayload,
  CreateModulePayload,
  CreateContentPayload,
  ContentDetailsPayload,
  InstructorCourse,
  getInstructorCourses,
  updateCourse,
  submitCourse,
  publishCourse,
  syncCourseAI,
  getDashboardStats,
  getRecentEnrollments,
  getPendingSync,
  getCourseStats,
  GetStudentsParams,
  getInstructorStudents,
  getStudentDetail,
  getStudentQuizzes,
  getStudentComments,
  saveBulkOutline,
  getPresignedUrl,
  PresignVideoPayload,
  notifyUploadComplete,
  UploadCompletePayload,
  getVideoStatus
} from '@/lib/services/instructor.service'
import { generateOutlineAI, GenerateOutlineRequest } from '@/lib/services/ai.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateCourse() {
  return useMutation({
    mutationFn: () => createCourse(),
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

export function useCreateQuizQuestion() {
  return useMutation({
    mutationFn: ({ contentId, payload }: { contentId: number; payload: any }) =>
      createQuizQuestion(contentId, payload),
  })
}

export function useUpdateQuizQuestion() {
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: any }) =>
      updateQuizQuestion(questionId, payload),
  })
}

export function useDeleteQuizQuestion() {
  return useMutation({
    mutationFn: (questionId: number) => deleteQuizQuestion(questionId),
  })
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['instructor-course', id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  })
}

export function useInstructorContent(contentId: number | null, contentType?: string) {
  return useQuery({
    queryKey: ['instructor-content', contentId, contentType],
    queryFn: () => getContentById(contentId!, contentType),
    enabled: !!contentId,
    staleTime: 0, // Always refetch when editing
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

export function useSubmitCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => submitCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', Number(id)] })
    },
  })
}

export function usePublishCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => publishCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', Number(id)] })
    },
  })
}

export function useSyncCourseAI() {
  return useMutation({
    mutationFn: (courseId: number | string) => syncCourseAI(courseId),
  })
}


export function useDashboardStats() {
  return useQuery({
    queryKey: ['instructor-dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentEnrollments() {
  return useQuery({
    queryKey: ['instructor-recent-enrollments'],
    queryFn: getRecentEnrollments,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePendingSync() {
  return useQuery({
    queryKey: ['instructor-pending-sync'],
    queryFn: getPendingSync,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCourseStats() {
  return useQuery({
    queryKey: ['instructor-course-stats'],
    queryFn: getCourseStats,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInstructorStudents(params?: GetStudentsParams) {
  return useQuery({
    queryKey: ['instructor-students', params],
    queryFn: () => getInstructorStudents(params),
  })
}

export function useStudentDetail(studentId: number | string) {
  return useQuery({
    queryKey: ['instructor-student-detail', studentId],
    queryFn: () => getStudentDetail(studentId),
    enabled: !!studentId,
  })
}

export function useStudentQuizzes(studentId: number | string) {
  return useQuery({
    queryKey: ['instructor-student-quizzes', studentId],
    queryFn: () => getStudentQuizzes(studentId),
    enabled: !!studentId,
  })
}

export function useStudentComments(studentId: number | string) {
  return useQuery({
    queryKey: ['instructor-student-comments', studentId],
    queryFn: () => getStudentComments(studentId),
    enabled: !!studentId,
  })
}

export function useGenerateOutlineAI() {
  return useMutation({
    mutationFn: (payload: GenerateOutlineRequest) => generateOutlineAI(payload),
  })
}

export function useSaveBulkOutline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, outlineData }: { courseId: number | string; outlineData: any }) => 
      saveBulkOutline(courseId, outlineData),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course-outline', courseId] })
      queryClient.invalidateQueries({ queryKey: ['instructor-course', courseId] })
    }
  })
}

export function useVideoPresign() {
  return useMutation({
    mutationFn: (payload: PresignVideoPayload) => getPresignedUrl(payload)
  })
}

export function useVideoUploadComplete() {
  return useMutation({
    mutationFn: (payload: UploadCompletePayload) => notifyUploadComplete(payload)
  })
}

export function useVideoStatus(contentId: number | string | null) {
  return useQuery({
    queryKey: ['instructor-video-status', contentId],
    queryFn: () => getVideoStatus(contentId!),
    enabled: !!contentId,
    refetchInterval: (query: any) => {
      const data = query?.state?.data || query
      // Poll every 3 seconds if status is processing/pending
      if (data?.uploadStatus === 'PROCESSING' || data?.uploadStatus === 'PENDING') {
        return 3000
      }
      return false
    }
  })
}
