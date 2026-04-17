import { api } from '@/lib/axios'
import { SyllabusResponse, InstructorModule } from '@/types/learning'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  title: string
  description: string
  categoryId: number
  price: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  thumbnail: string
  overview: string
  benefits: string[]
  requirements: string[]
  technique: string[]
  isFree?: boolean
  isPublish?: boolean
}

export interface CreateModulePayload {
  title: string
  description: string
  moduleOrder: number
  isPublish: boolean
}

export interface CreateContentPayload {
  title: string
  description?: string
  contentType: 'VIDEO' | 'READING' | 'QUIZ'
  contentOrder: number
  isPublish: boolean
}

export interface VideoDetailsPayload {
  platform: 'YOUTUBE' | 'VIMEO'
  videoId: string
  duration: number
}

export interface ReadingDetailsPayload {
  body: string
}

export interface QuizDetailsPayload {
  description: string
  duration: number
  passPercent: number
}

export interface QuizQuestionOptionPayload {
  id?: number
  optionText: string
  isCorrect: boolean
}

export interface QuizQuestionPayload {
  id?: number
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE'
  options: QuizQuestionOptionPayload[]
}

export type ContentDetailsPayload =
  | VideoDetailsPayload
  | ReadingDetailsPayload
  | QuizDetailsPayload

export interface CreatedCourse {
  id: number
  title: string
  description: string
  price: number
  level: string
  thumbnail: string
  overview: string
  benefits: string[]
  requirements: string[]
  technique: string[]
  categoryId: number
  categoryName: string
  category: { id: number; name: string }
  instructor: { id: number; username: string; email: string }
  isFree: boolean
  isPublish: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatedModule {
  id: number
  title: string
  description: string
  moduleOrder: number
  course: { id: number; title: string }
  createdAt: string
}

export interface CreatedContent {
  id: number
  title: string
  contentType: string
  contentOrder: number
  module: { id: number; title: string }
  createdAt: string
}

export interface Category {
  id: number
  name: string
  parent: Category | null
}

export interface ApplyInstructorPayload {
  headline: string
  bio: string
  affiliations: string[]
  websiteUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
}

export interface ApplyInstructorResponse {
  profileId: number
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface InstructorCourse {
  id: number
  title: string
  thumbnail: string
  categoryName: string
  price: number
  isFree: boolean
  isPublish: boolean
  level: string
  updatedAt: string
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function createCourse(payload: CreateCoursePayload): Promise<CreatedCourse> {
  const { data } = await api.post('/v1/instructor/courses', payload)
  return data
}

export async function createModule(
  courseId: number,
  payload: CreateModulePayload
): Promise<CreatedModule> {
  const { data } = await api.post(`/v1/instructor/courses/${courseId}/modules`, payload)
  return data
}

export async function createContent(
  moduleId: number,
  payload: CreateContentPayload
): Promise<CreatedContent> {
  const { data } = await api.post(`/v1/instructor/modules/${moduleId}/contents`, payload)
  return data
}

export async function updateContentDetails(
  contentId: number,
  payload: ContentDetailsPayload
): Promise<void> {
  await api.put(`/v1/instructor/contents/${contentId}/details`, payload)
}

export async function createQuizQuestion(
  contentId: number,
  payload: QuizQuestionPayload
): Promise<any> {
  const { data } = await api.post(`/v1/instructor/contents/${contentId}/questions`, payload)
  return data
}

export async function updateQuizQuestion(
  questionId: number,
  payload: QuizQuestionPayload
): Promise<any> {
  const { data } = await api.put(`/v1/instructor/questions/${questionId}`, payload)
  return data
}

export async function deleteQuizQuestion(questionId: number): Promise<void> {
  await api.delete(`/v1/instructor/questions/${questionId}`)
}

export async function getCourseById(id: number | string): Promise<CreatedCourse> {
  const { data } = await api.get(`/v1/instructor/courses/${id}`)
  return data
}

export async function getCourseSyllabus(id: number | string): Promise<InstructorModule[]> {
  const { data } = await api.get(`/v1/instructor/courses/${id}/syllabus`)
  return data
}

export async function updateModule(
  moduleId: number,
  payload: Partial<CreateModulePayload>
): Promise<CreatedModule> {
  const { data } = await api.put(`/v1/instructor/modules/${moduleId}`, payload)
  return data
}

export async function deleteModule(moduleId: number): Promise<void> {
  await api.delete(`/v1/instructor/modules/${moduleId}`)
}

export async function updateContent(
  contentId: number,
  payload: Partial<CreateContentPayload>
): Promise<CreatedContent> {
  const { data } = await api.put(`/v1/instructor/contents/${contentId}`, payload)
  return data
}

export async function deleteContent(contentId: number): Promise<void> {
  await api.delete(`/v1/instructor/contents/${contentId}`)
}

export async function getContentById(contentId: number | string, contentType?: string): Promise<any> {
  const params = contentType === 'QUIZ' ? '?includeDetails=true' : ''
  const { data } = await api.get(`/v1/instructor/contents/${contentId}${params}`)
  return data
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}

export async function applyInstructor(payload: ApplyInstructorPayload): Promise<ApplyInstructorResponse> {
  const { data } = await api.post('/v1/instructors/apply', payload)
  return data
}

export async function getInstructorCourses(): Promise<InstructorCourse[]> {
  const { data } = await api.get('/v1/instructor/courses')
  return data
}

export async function updateCourse(id: number | string, payload: CreateCoursePayload): Promise<CreatedCourse> {
  const { data } = await api.put(`/v1/instructor/courses/${id}`, payload)
  return data
}
