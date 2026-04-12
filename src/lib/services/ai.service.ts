import { api } from '@/lib/axios'

export interface AiChatRequest {
  courseId?: number
  contentId?: number
  message: string
  currentLesson?: string
}

export type AiAction = 'NONE' | 'CONTINUE_LEARNING'

export interface AiChatResponse {
  status: 'success' | 'error'
  reply: string
  action: AiAction
  targetId?: number | null
  target_id?: number | null
  sources_used: number
}

export async function sendAiChatMessage(payload: AiChatRequest): Promise<AiChatResponse> {
  const { data } = await api.post('/v1/ai/chat', payload)
  return data
}
