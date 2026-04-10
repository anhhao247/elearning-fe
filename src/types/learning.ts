export interface LearningContentItem {
  id: number
  title: string
  contentType: "VIDEO" | "READING" | "QUIZ"
  contentOrder: number
  isCompleted: boolean
}

export interface LearningModule {
  id: number
  title: string
  moduleOrder: number
  contents: LearningContentItem[]
}

export interface SyllabusResponse {
  courseId: number
  modules: LearningModule[]
}

export interface VideoDetails {
  platform: "YOUTUBE" | "VIMEO" | "OTHER"
  platformVideoId: string
  duration: number
}

export interface ReadingDetails {
  body: string
}

export interface QuizDetails {
  description: string
  quizDuration: number
  passPercent: number
}

export interface ContentDetailResponse {
  id: number
  title: string
  description: string
  contentType: "VIDEO" | "READING" | "QUIZ"
  contentOrder: number
  videoDetails: VideoDetails | null
  readingDetails: ReadingDetails | null
  quizDetails: QuizDetails | null
}

