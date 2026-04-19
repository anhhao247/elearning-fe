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
export async function syncCourseAI(courseId: number | string): Promise<any> {
  const { data } = await api.post(`/v1/instructor/courses/${courseId}/sync-ai`)
  return data
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardStats {
  totalStudents: number
  activeCourses: number
  totalRevenue: number
  pendingSyncContent: number
  totalStudentsChange: string
  activeCoursesChange: string
  totalRevenueChange: string
  pendingSyncContentChange: string
}

export interface RecentEnrollment {
  enrollmentId: number
  studentName: string
  studentEmail: string
  courseName: string
  enrollmentDate: string
  progressPercent: number
}

export interface PendingSyncContent {
  contentId: number
  contentTitle: string
  contentType: 'VIDEO' | 'READING' | 'QUIZ'
  courseName: string
  createdAt: string
}

export interface CourseStat {
  courseId: number
  courseName: string
  studentCount: number
  revenue: number
  status: string
  rating: number
  reviewCount: number
  needsAiSync: boolean
}

// ─── Dashboard API ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/v1/instructor/dashboard/stats')
  return data
}

export async function getRecentEnrollments(): Promise<RecentEnrollment[]> {
  const { data } = await api.get('/v1/instructor/dashboard/recent-enrollments')
  return data
}

export async function getPendingSync(): Promise<PendingSyncContent[]> {
  const { data } = await api.get('/v1/instructor/dashboard/pending-sync')
  return data
}

export async function getCourseStats(): Promise<CourseStat[]> {
  const { data } = await api.get('/v1/instructor/dashboard/course-stats')
  return data
}

// ─── Students Types ─────────────────────────────────────────────────────────

export interface EnrolledCourse {
  courseId: number
  courseName: string
  progressPercent: number
  enrolledAt: string
  pricePaid: number
}

export interface InstructorStudent {
  studentId: number
  studentName: string
  studentEmail: string
  enrolledCourses: EnrolledCourse[]
  totalPaid: number
  lastEnrolledAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: any
  size: number
  sort: any
  totalElements: number
  totalPages: number
}

export interface GetStudentsParams {
  courseId?: number
  keyword?: string
  page?: number
  size?: number
  sort?: string[]
}

// ─── Students API ───────────────────────────────────────────────────────────

export async function getInstructorStudents(params?: GetStudentsParams): Promise<PaginatedResponse<InstructorStudent>> {
  const queryParams = new URLSearchParams()
  if (params?.courseId) queryParams.append('courseId', params.courseId.toString())
  if (params?.keyword) queryParams.append('keyword', params.keyword)
  if (params?.page !== undefined) queryParams.append('page', params.page.toString())
  if (params?.size !== undefined) queryParams.append('size', params.size.toString())
  if (params?.sort) {
    params.sort.forEach(s => queryParams.append('sort', s))
  }

  const queryString = queryParams.toString()
  const url = queryString ? `/v1/instructor/students?${queryString}` : '/v1/instructor/students'
  
  const { data } = await api.get(url)
  return data
}
