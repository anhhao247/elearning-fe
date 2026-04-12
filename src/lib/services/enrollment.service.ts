import { api } from '@/lib/axios'

export interface EnrollmentResponse {
  enrollmentId: number
  userId: number
  courseId: number
  courseTitle: string
  enrolledAt: string
  progressPercent: number
  pricePaid: number
  transactionStatus: string
  resumeContentId: number | null
  resumeContentType: string | null
}

export async function enrollFreeCourse(courseId: number): Promise<EnrollmentResponse> {
  const { data } = await api.post(`/v1/enrollments/free/${courseId}`, { courseId })
  return data
}
