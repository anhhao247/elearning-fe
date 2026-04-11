import { 
  SyllabusResponse, 
  ContentDetailResponse, 
  QuizFetchResponse, 
  QuizSubmissionPayload, 
  QuizResultResponse 
} from '@/types/learning'
import { api } from '../axios'

export async function getSyllabus(courseId: number | string): Promise<SyllabusResponse> {
  const { data } = await api.get(`/v1/courses/${courseId}/syllabus`)
  return data
}

export async function getContentDetail(contentId: number | string): Promise<ContentDetailResponse> {
  const { data } = await api.get(`/v1/contents/${contentId}`)
  return data
}

export async function getQuizByContentId(contentId: number | string): Promise<QuizFetchResponse> {
  const { data } = await api.get(`/v1/contents/${contentId}/quiz`)
  return data
}

export async function submitQuiz(
  contentId: number | string, 
  userId: number | string, 
  payload: QuizSubmissionPayload
): Promise<QuizResultResponse> {
  const { data } = await api.post(`/v1/contents/${contentId}/quiz/submit`, payload, {
    params: { userId }
  })
  return data
}
