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

export interface InstructorContent {
  contentId: number
  title: string
  contentType: "VIDEO" | "READING" | "QUIZ"
  contentOrder: number
  isPublish: boolean
}

export interface InstructorModule {
  moduleId: number
  title: string
  description: string
  moduleOrder: number
  isPublish: boolean
  contents: InstructorContent[]
}

export interface VideoDetails {
  platform: "YOUTUBE" | "VIMEO" | "OTHER"
  videoId: string
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
  isCompleted: boolean
  videoDetails: VideoDetails | null
  readingDetails: ReadingDetails | null
  quizDetails: QuizDetails | null
}

export interface QuizOption {
  optionId: number
  optionText: string
}

export interface QuizQuestion {
  questionId: number
  questionText: string
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE"
  options: QuizOption[]
}

export interface QuizFetchResponse {
  quizId: number
  description: string
  quizDuration: number
  passPercent: number
  questions: QuizQuestion[]
}

export interface QuizSubmissionPayload {
  answers: {
    questionId: number
    chosenOptionIds: number[]
  }[]
}

export interface QuizResultAnswer {
  questionId: number
  correctOptionIds: number[]
}

export interface QuizResultResponse {
  score: number
  isPassed: boolean
  correctAnswers: QuizResultAnswer[]
}

export interface CompleteContentResponse {
  contentId: number
  isCompleted: boolean
  newProgressPercent: number
}

export interface ContentComment {
  id: number
  commentContent: string
  userId: number
  username: string
  avatar: string | null
  contentId: number
  parentId: number | null
  createdAt: string
  updatedAt: string
  replies: ContentComment[]
}

export interface CreateCommentPayload {
  commentContent: string
  parentId?: number | null
}

export interface UserNote {
  id: number
  userId: number
  contentId: number
  courseId: number
  title: string | null
  body: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotePayload {
  contentId: number
  courseId: number
  title?: string | null
  body: string
}

export interface UpdateNotePayload {
  title?: string | null
  body: string
}

