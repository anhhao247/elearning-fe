import { 
  SyllabusResponse, 
  ContentDetailResponse, 
  QuizFetchResponse, 
  QuizSubmissionPayload, 
  QuizResultResponse, 
  CompleteContentResponse,
  ContentComment,
  CreateCommentPayload,
  UserNote,
  CreateNotePayload,
  UpdateNotePayload
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

export async function completeContent(contentId: number | string): Promise<CompleteContentResponse> {
  const { data } = await api.post(`/v1/contents/${contentId}/complete`)
  return data
}

export async function getComments(contentId: number | string): Promise<ContentComment[]> {
  const { data } = await api.get(`/v1/contents/${contentId}/comments`)
  return data
}

export async function createComment(contentId: number | string, payload: CreateCommentPayload): Promise<ContentComment> {
  const { data } = await api.post(`/v1/contents/${contentId}/comments`, payload)
  return data
}

// User Notes API
export async function getNotes(courseId?: number | string, contentId?: number | string): Promise<UserNote[]> {
  const { data } = await api.get(`/v1/user-notes`, {
    params: { courseId, contentId }
  })
  return data
}

export async function createNote(payload: CreateNotePayload): Promise<UserNote> {
  const { data } = await api.post(`/v1/user-notes`, payload)
  return data
}

export async function updateNote(id: number | string, payload: UpdateNotePayload): Promise<UserNote> {
  const { data } = await api.put(`/v1/user-notes/${id}`, payload)
  return data
}

export async function deleteNote(id: number | string): Promise<void> {
  await api.delete(`/v1/user-notes/${id}`)
}
