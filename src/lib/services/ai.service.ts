import { api } from '@/lib/axios'

export interface AiChatRequest {
  courseId: number
  message: string
}

export interface AiChatResponse {
  status: 'success' | 'error'
  reply: string
  sourcesUsed: number
}

export async function sendAiChatMessage(payload: AiChatRequest): Promise<AiChatResponse> {
  const { data } = await api.post('/v1/ai/chat', payload)
  return data
}
