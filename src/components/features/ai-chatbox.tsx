"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bot, X, Send, Loader2, Sparkles, BookOpen, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendAiChatMessage, AiChatResponse } from "@/lib/services/ai.service"
import { getCourseDetail } from "@/lib/services/course.service"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import { MarkdownContent } from "@/components/ui/markdown-content"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sourcesUsed?: number
  timestamp: Date
  /** Hiển thị nút CTA khi action === CONTINUE_LEARNING */
  ctaLabel?: string
  ctaOnClick?: () => void
  suggestedCourses?: any[]
}

interface AiChatboxProps {
  courseId?: number
  contentId?: number
  currentLessonTitle?: string
}

export function AiChatbox({ courseId, contentId, currentLessonTitle }: AiChatboxProps) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào${user?.firstName ? ` ${user.firstName}` : ""}! 👋 Tôi là trợ lý AI của Learnly. Hãy hỏi tôi về các khóa học hoặc nói "Cho tôi học tiếp" để tôi đưa bạn vào bài học nhé!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto-expand textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "20px" // Reset to calculate correct scrollHeight
      const scrollHeight = inputRef.current.scrollHeight
      inputRef.current.style.height = `${Math.min(scrollHeight, 100)}px`
    }
  }, [input])

  // --------------------------------------------------------------------------
  // Handle CONTINUE_LEARNING action
  // --------------------------------------------------------------------------
  const handleContinueLearning = useCallback(async (targetCourseId: number) => {
    setIsNavigating(true)
    toast.loading("Đang tìm bài học cho bạn...", { id: "navigating" })

    try {
      const courseData = await getCourseDetail(targetCourseId)

      // Ưu tiên resumeContentId, fallback về content đầu tiên của module đầu tiên
      const targetContentId: number | undefined =
        courseData.resumeContentId ??
        courseData.modules?.[0]?.contents?.[0]?.id

      const slug: string = courseData.slug ?? String(targetCourseId)

      if (!targetContentId) {
        throw new Error("Không tìm thấy bài học để tiếp tục.")
      }

      toast.dismiss("navigating")
      toast.success("Đang mở bài học...")
      router.push(`/courses/learning/${slug}/${targetContentId}`)
    } catch (error) {
      console.error("[AiChatbox] handleContinueLearning error:", error)
      toast.dismiss("navigating")
      toast.error("Không thể lấy thông tin bài học. Chuyển tới trang khóa học.")
      router.push(`/courses/${targetCourseId}`)
    } finally {
      setIsNavigating(false)
    }
  }, [router])

  // --------------------------------------------------------------------------
  // Build AI message from response
  // --------------------------------------------------------------------------
  const buildAiMessage = useCallback(
    async (response: AiChatResponse): Promise<Message> => {
      const base: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        sourcesUsed: response.sources_used,
        timestamp: new Date(),
      }

      if (response.action === "CONTINUE_LEARNING") {
        const targetId = response.targetId ?? response.target_id
        if (targetId) {
          base.ctaLabel = "Học tiếp ngay →"
          base.ctaOnClick = () => handleContinueLearning(targetId)
        }
      }

      if (response.action === "SUGGEST_COURSE" && response.suggestedCourseIds?.length) {
        // Take only first 3
        const idsToFetch = response.suggestedCourseIds.slice(0, 3)
        try {
          const courseDetails = await Promise.all(
            idsToFetch.map(id => getCourseDetail(id).catch(() => null))
          )
          base.suggestedCourses = courseDetails.filter(Boolean)
        } catch (err) {
          console.error("Failed to fetch suggested courses:", err)
        }
      }

      return base
    },
    [handleContinueLearning]
  )

  // --------------------------------------------------------------------------
  // Send message
  // --------------------------------------------------------------------------
  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || isNavigating) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendAiChatMessage({
        courseId,
        contentId,
        message: trimmed,
        currentLesson: currentLessonTitle,
      })

      const aiMessage = await buildAiMessage(response)
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      toast.error("Không thể kết nối với AI. Vui lòng thử lại.")
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      setInput(trimmed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  // Chỉ hiển thị khi đã hydrate và user đã đăng nhập
  if (!_hasHydrated || !user) return null

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Chat Window                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 z-[1001]",
          "w-[calc(100vw-2rem)] sm:w-[400px]",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col rounded-2xl shadow-2xl border border-border/50 bg-card overflow-hidden h-[500px] sm:h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Trợ lý học tập AI</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/70 text-[11px]">Luôn sẵn sàng hỗ trợ</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1 max-w-[78%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Bubble */}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
                        : "bg-muted text-foreground rounded-tl-sm shadow-sm border border-border/40"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownContent
                        content={msg.content}
                        className={cn(
                          "prose-p:m-0 prose-pre:my-2 prose-pre:max-w-full overflow-hidden"
                        )}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* CTA Button for CONTINUE_LEARNING */}
                  {msg.ctaLabel && msg.ctaOnClick && (
                    <button
                      onClick={msg.ctaOnClick}
                      disabled={isNavigating}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/30 rounded-lg px-3 py-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-0.5"
                    >
                      {isNavigating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3 h-3" />
                      )}
                      {isNavigating ? "Đang chuyển trang..." : msg.ctaLabel}
                    </button>
                  )}

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Suggested Courses Cards */}
                  {msg.suggestedCourses && msg.suggestedCourses.length > 0 && (
                    <div className="flex flex-col gap-2.5 mt-3 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gợi ý cho bạn:</p>
                      {msg.suggestedCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => router.push(`/courses/${course.slug || course.id}`)}
                          className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-border/60 shadow-sm hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                        >
                          <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                            <img
                              src={course.thumbnail || "/placeholder-course.png"}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-600 transition-colors">
                              {course.title}
                            </p>

                            <div className="flex items-center gap-2 mt-0.5 opacity-80">
                              <span className="text-[10px] text-slate-500 truncate lowercase first-letter:uppercase">
                                {course.instructor?.fullName || course.instructorName || "Giảng viên Learnly"}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                              <span className="text-[10px] font-bold text-violet-500">
                                {course.level || "Tất cả"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400">
                                {course.isFree || course.price === 0
                                  ? "Miễn phí"
                                  : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.price)}
                              </span>
                              <span className="text-[9px] font-bold text-primary group-hover:underline">
                                Xem ngay →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 border border-border/40 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="px-3 py-3 border-t border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
            <div className="flex items-end gap-2 bg-muted/60 rounded-xl border border-border/50 px-3 py-2 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={courseId ? "Hỏi gì về khóa học này..." : "Hỏi về khóa học hoặc nói 'Học tiếp'..."}
                rows={1}
                disabled={isLoading || isNavigating}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[20px] max-h-[100px] py-0.5 disabled:opacity-50"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isNavigating}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                  input.trim() && !isLoading && !isNavigating
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:opacity-90 hover:scale-105 shadow-md"
                    : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                )}
                aria-label="Gửi tin nhắn"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Nhấn{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Enter</kbd>{" "}
              để gửi ·{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Shift+Enter</kbd>{" "}
              xuống dòng
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FAB Button                                                          */}
      {/* ------------------------------------------------------------------ */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-[1000]",
          "w-14 h-14 rounded-full shadow-xl",
          "flex items-center justify-center",
          "bg-gradient-to-br from-violet-600 to-indigo-600",
          "text-white transition-all duration-300",
          "hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/30",
          "active:scale-95"
        )}
        aria-label={isOpen ? "Đóng chat AI" : "Mở chat AI"}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"
          )}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <X className="w-6 h-6" />
        </div>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-violet-500/40 pointer-events-none" />
        )}
      </button>
    </>
  )
}
