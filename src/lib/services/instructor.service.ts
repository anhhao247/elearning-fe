import { api } from '@/lib/axios'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  title: string
  description: string
  categoryId: number
  price: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface CreateModulePayload {
  title: string
  description: string
  moduleOrder: number
}

export interface CreateContentPayload {
  title: string
  contentType: 'VIDEO' | 'READING' | 'QUIZ'
  contentOrder: number
}

export interface VideoDetailsPayload {
  platform: 'YOUTUBE' | 'VIMEO'
  platformVideoId: string
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
  category: { id: number; name: string }
  instructor: { id: number; username: string; email: string }
  isPublish: boolean
  createdAt: string
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

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function createCourse(payload: CreateCoursePayload): Promise<CreatedCourse> {
  const { data } = await api.post('/instructor/courses', payload)
  return data
}

export async function createModule(
  courseId: number,
  payload: CreateModulePayload
): Promise<CreatedModule> {
  const { data } = await api.post(`/instructor/courses/${courseId}/modules`, payload)
  return data
}

export async function createContent(
  moduleId: number,
  payload: CreateContentPayload
): Promise<CreatedContent> {
  const { data } = await api.post(`/instructor/modules/${moduleId}/contents`, payload)
  return data
}

export async function updateContentDetails(
  contentId: number,
  payload: ContentDetailsPayload
): Promise<void> {
  await api.put(`/instructor/contents/${contentId}/details`, payload)
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}

export async function applyInstructor(payload: ApplyInstructorPayload): Promise<ApplyInstructorResponse> {
  const { data } = await api.post('/v1/instructors/apply', payload)
  return data
}
