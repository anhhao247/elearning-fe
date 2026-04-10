import { api } from '@/lib/axios'
import { SyllabusResponse, ContentDetailResponse } from '@/types/learning'

export async function getSyllabus(courseId: number | string): Promise<SyllabusResponse> {
  const { data } = await api.get(`/v1/courses/${courseId}/syllabus`)
  return data
}

export async function getContentDetail(contentId: number | string): Promise<ContentDetailResponse> {
  const { data } = await api.get(`/v1/contents/${contentId}`)
  return data
}
