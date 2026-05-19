import { api } from '@/lib/axios'
import { AdminCourseSubmissionsResponse, AdminCourseDetail } from '@/types/admin-course'

export const getCourseSubmissions = async (
  page: number = 0,
  size: number = 10,
  status?: string
): Promise<AdminCourseSubmissionsResponse> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('size', size.toString())
  if (status && status !== 'ALL') {
    params.append('status', status)
  }
  const response = await api.get<AdminCourseSubmissionsResponse>(`/v1/admin/courses/submissions?${params.toString()}`)
  return response.data
}

export const getCourseForReview = async (courseId: number): Promise<AdminCourseDetail> => {
  const response = await api.get<AdminCourseDetail>(`/v1/admin/courses/${courseId}`)
  return response.data
}

export const approveCourse = async (courseId: number): Promise<void> => {
  await api.put(`/v1/admin/courses/${courseId}/approve`)
}

export const rejectCourse = async (courseId: number, reason: string): Promise<void> => {
  await api.put(`/v1/admin/courses/${courseId}/reject`, { reason })
}
