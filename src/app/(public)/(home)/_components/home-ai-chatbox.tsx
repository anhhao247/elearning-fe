"use client"

import { AiChatbox } from "@/components/features/ai-chatbox"

/**
 * Wrapper (Client Component) để nhúng AiChatbox vào Server Component (trang home).
 * Không truyền courseId → chatbox hoạt động ở chế độ tổng quát:
 * user có thể hỏi chung hoặc nói "Học tiếp" để AI điều hướng.
 */
export function HomeAiChatbox() {
  return <AiChatbox />
}
