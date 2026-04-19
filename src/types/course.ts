import { z } from "zod"

export interface Course {
  id: number
  title: string
  description?: string
  shortDescription?: string
  thumbnail?: string | null
  price: number
  isFree?: boolean
  level: string
  categoryId?: number
  categoryName?: string
  instructorName?: string
  createdAt: string
  updatedAt?: string
  overview?: string
  requirements?: string[]
  benefits?: string[]
  technique?: string[]
}

export interface PageResponse<T> {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

// Interface cho My Course trả về từ API /v1/me/courses
export interface MyCourse {
  id: number
  title: string
  thumbnail: string | null
  description: string | null
  level: string
  enrolledAt: string
  progress: number
}

// Cấu trúc phân trang đặc thù của Spring (nằm ở route /me/courses)
export interface MyCoursesPageResponse {
  content: MyCourse[]
  empty: boolean
  first: boolean
  last: boolean
  number: number // current page (0-based)
  numberOfElements: number
  size: number
  totalElements: number
  totalPages: number
}

// Zod Schemas for Course Detail
export const courseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable().optional(),
  parentName: z.string().nullable().optional(),
})

export const courseInstructorSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
})

export const courseContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  contentType: z.string(),
  contentOrder: z.number(),
  description: z.string().nullable().optional(),
  videoDuration: z.number().nullable().optional(),
})

export const courseModuleSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  moduleOrder: z.number(),
  lessonCount: z.number(),
  contents: z.array(courseContentSchema),
})

export const courseReviewSchema = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string(),
  reviewerName: z.string(),
  reviewerAvatar: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const courseDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  price: z.number(),
  discount: z.number().optional(),
  discountedPrice: z.number().optional(),
  isFree: z.boolean(),
  level: z.string(),
  category: courseCategorySchema,
  instructor: courseInstructorSchema,
  totalStudents: z.number(),
  totalLessons: z.number(),
  totalChapters: z.number(),
  totalDuration: z.string().optional(),
  totalResources: z.number().optional(),
  avgRating: z.number(),
  totalReviews: z.number(),
  ratingDistribution: z.record(z.string(), z.number()).optional(),
  isEnrolled: z.boolean().optional(),
  hasCertificate: z.boolean().optional(),
  hasCertificate2: z.boolean().optional(),
  hasLifetimeAccess: z.boolean().optional(),
  hasMoneyBackGuarantee: z.boolean().optional(),
  isMobileAccessible: z.boolean().optional(),
  progressPercent: z.number().optional(),
  resumeContentId: z.number().optional(),
  resumeContentType: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  overview: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  technique: z.array(z.string()).optional(),
  modules: z.array(courseModuleSchema).optional(),
  reviews: z.array(courseReviewSchema).optional(),
})

export type CourseDetail = z.infer<typeof courseDetailSchema>
export type CourseModule = z.infer<typeof courseModuleSchema>
export type CourseContent = z.infer<typeof courseContentSchema>
export type CourseReview = z.infer<typeof courseReviewSchema>
