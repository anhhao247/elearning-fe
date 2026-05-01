import { Course, PageResponse, MyCoursesPageResponse } from '@/types/course'
import { api } from '@/lib/axios'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

export async function getCourses(params: Record<string, string | string[] | undefined>): Promise<PageResponse<Course>> {
  const query = new URLSearchParams()
  
  // Default values
  query.set('page', params.page?.toString() || '0')
  query.set('limit', params.limit?.toString() || '9')
  query.set('sortBy', params.sortBy?.toString() || 'createdAt')
  query.set('sortDir', params.sortDir?.toString() || 'desc')

  Object.entries(params).forEach(([key, val]) => {
    // Skip defaults we already set and empty values
    if (['page', 'limit', 'sortBy', 'sortDir'].includes(key)) return
    if (val === undefined || val === null || val === '') return

    if (Array.isArray(val)) {
      val.forEach(v => query.append(key, v))
    } else {
      query.set(key, val)
    }
  })

  const response = await fetch(`${baseUrl}/v1/courses?${query.toString()}`, {
    cache: 'no-store', // Tắt cache để search/filter chính xác theo thời gian thực
  })

  // Nếu API down hoặc lỗi, ta ném exception để Error Boundary xử lý hoặc Loading Skeleton hiện fallback
  if (!response.ok) {
    throw new Error('Failed to fetch courses')
  }

  return response.json()
}

export async function getCourseDetail(id: string | number) {
  const { data } = await api.get(`/v1/courses/${id}`)
  return data
}

// Lấy danh sách khóa học của tôi (đã mua)
export async function getMyCourses(params: {
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: string
}): Promise<MyCoursesPageResponse> {
  const { data } = await api.get('/v1/me/courses', { params })
  return data
}

export async function addReview(courseId: number | string, payload: { rating: number, comment: string }) {
  const { data } = await api.post(`/v1/courses/${courseId}/reviews`, payload)
  return data
}
