import { Course, PageResponse, MyCoursesPageResponse } from '@/types/course'
import { api } from '@/lib/axios'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

export async function getCourses({
  page = '0',
  limit = '10',
  sortBy = 'createdAt',
  sortDir = 'desc',
  keyword = '',
  level = '',
  isFree = '',
  categoryId = ''
}: Record<string, string>): Promise<PageResponse<Course>> {
  const query = new URLSearchParams()
  query.set('page', page)
  query.set('limit', limit)
  if (sortBy) query.set('sortBy', sortBy)
  if (sortDir) query.set('sortDir', sortDir)
  if (keyword) query.set('keyword', keyword)
  if (level) query.set('level', level)
  if (isFree !== '') query.set('isFree', isFree)
  if (categoryId) query.set('categoryId', categoryId)

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
  const response = await fetch(`${baseUrl}/v1/courses/${id}`, {
    cache: 'no-store', // Không lưu cache để test, hoặc thay đổi cache pattern theo nhu cầu
  })

  if (!response.ok) {
    throw new Error('Failed to fetch course detail')
  }

  return response.json()
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
