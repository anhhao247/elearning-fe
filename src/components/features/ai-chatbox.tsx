"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Send, Loader2, Sparkles, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendAiChatMessage } from "@/lib/services/ai.service"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sourcesUsed?: number
  timestamp: Date
}

interface AiChatboxProps {
  courseId: number
  contentId?: number
  currentLessonTitle?: string
}

export function AiChatbox({ courseId, contentId, currentLessonTitle }: AiChatboxProps) {
  const { user, _hasHydrated } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào${user?.firstName ? ` ${user.firstName}` : ''}! 👋 Tôi là trợ lý AI của khóa học này. Hãy hỏi tôi bất cứ điều gì về nội dung khóa học nhé!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

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
        message: trimmed,
        contentId,
        currentLesson: currentLessonTitle
      })

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        sourcesUsed: response.sourcesUsed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch {
      toast.error("Không thể kết nối với AI. Vui lòng thử lại.")
      // Remove the optimistic user message on failure
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }

  if (!_hasHydrated || !user) return null

  return (
    <>
      {/* Chat Window */}
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

                <div className={cn("flex flex-col gap-1 max-w-[78%]", msg.role === "user" ? "items-end" : "items-start")}>
                  {/* Bubble */}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
                        : "bg-muted text-foreground rounded-tl-sm shadow-sm border border-border/40"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    {msg.sourcesUsed !== undefined && msg.sourcesUsed > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium">
                        <BookOpen className="w-2.5 h-2.5" />
                        {msg.sourcesUsed} nguồn
                      </span>
                    )}
                  </div>
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
                placeholder="Hỏi gì về khóa học này..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[20px] max-h-[100px] py-0.5 disabled:opacity-50"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                  input.trim() && !isLoading
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
              Nhấn <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Enter</kbd> để gửi · <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Shift+Enter</kbd> xuống dòng
            </p>
          </div>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-[1000]",
          "w-14 h-14 rounded-full shadow-xl",
          "flex items-center justify-center",
          "bg-gradient-to-br from-violet-600 to-indigo-600",
          "text-white transition-all duration-300",
          "hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/30",
          "active:scale-95",
          isOpen && "rotate-0"
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
