export interface CourseSubmission {
  approvalStatus: string
  categoryName: string
  contentCount: number
  contentModified: boolean
  courseId: number
  hasPendingUpdate: boolean
  instructorId: number
  instructorName: string
  instructorUsername: string
  isPublish: boolean
  level: string
  moduleCount: number
  pendingChanges: any[]
  thumbnail: string
  title: string
  updatedAt: string
  isFirstSubmit?: boolean
}

export interface AdminCourseSubmissionsResponse {
  content: CourseSubmission[]
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

export interface AdminCourseDetail {
  courseId: number
  title: string
  description: string
  thumbnail: string
  level: string
  price: number
  oldPrice: number
  isFree: boolean
  isPublish: boolean
  approvalStatus: string
  rejectionReason: string | null
  isFirstSubmit: boolean
  hasPendingUpdate: boolean
  contentModified: boolean
  category: {
    id: number
    name: string
  }
  instructor: {
    id: number
    fullName: string
    username: string
    email: string
    avatar: string | null
    headline: string
    totalCourses: number
    totalStudents: number
  }
  overview: string
  requirements: string[]
  benefits: string[]
  technique: string[]
  stats: {
    moduleCount: number
    contentCount: number
    videoCount: number
    readingCount: number
    quizCount: number
    totalDuration: number
  }
  curriculum: AdminModule[]
  pendingChanges: any[]
  submittedAt: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface AdminModule {
  moduleId: number
  title: string
  moduleOrder: number
  contents: AdminContent[]
}

export interface AdminContent {
  contentId: number
  title: string
  contentType: "VIDEO" | "READING" | "QUIZ"
  contentOrder: number
  isIndex: boolean
  video: {
    platform: string
    videoId: string
    duration: number
  } | null
  reading: {
    body: string
  } | null
  quiz: {
    description: string
    duration: number
    passPercent: number
    questions: any[]
  } | null
}
