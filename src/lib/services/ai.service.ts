import { api } from '@/lib/axios'

export interface AiChatRequest {
  courseId?: number
  contentId?: number
  message: string
  currentLesson?: string
}

export type AiAction = 'NONE' | 'CONTINUE_LEARNING' | 'SUGGEST_COURSE'

export interface AiChatResponse {
  status: 'success' | 'error'
  reply: string
  action: AiAction
  targetId?: number | null
  target_id?: number | null
  sources_used: number
  suggestedCourseIds?: number[]
}

export async function sendAiChatMessage(payload: AiChatRequest): Promise<AiChatResponse> {
  const { data } = await api.post('/v1/ai/chat', payload)
  return data
}

export interface GenerateQuestionRequest {
  userId: number
  courseId: number
  difficulty: "dễ" | "trung bình" | "khó"
  previousQuestions: string[]
}

export interface GenerateQuestionResponse {
  status: "success" | "error"
  question: string
  difficulty: string
}

export interface QAPair {
  question: string
  answer: string
}

export interface EvaluateSessionRequest {
  userId: number
  courseId: number
  qaPairs: QAPair[]
}

export interface EvaluationResult {
  overall_score: number
  overall_feedback: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string
}

export interface EvaluateSessionResponse {
  status: "success" | "error"
  evaluation: EvaluationResult
}

export async function generateInterviewQuestion(payload: GenerateQuestionRequest): Promise<GenerateQuestionResponse> {
  const { data } = await api.post('/v1/ai/qa/generate-question', payload)
  return data
}

export async function evaluateInterviewSession(payload: EvaluateSessionRequest): Promise<EvaluateSessionResponse> {
  const { data } = await api.post('/v1/ai/qa/evaluate-session', payload)
  return data
}

export interface GenerateOutlineRequest {
  topic: string
  target_audience: string
  objectives: string
  additional_requirements?: string
}

export async function generateOutlineAI(payload: GenerateOutlineRequest): Promise<any> {
  const { data } = await api.post('/v1/ai/course/generate-outline', payload)
  return data
}
