"use client"

import { VoiceChatbot } from "@/components/features/voice-chatbot"

/**
 * Wrapper (Client Component) để nhúng VoiceChatbot vào Server Component (trang home).
 * Không truyền courseId → chatbox hoạt động ở chế độ tổng quát:
 * user có thể hỏi chung hoặc nói "Học tiếp" để AI điều hướng.
 */
export function HomeAiChatbox() {
  return <VoiceChatbot />
}
