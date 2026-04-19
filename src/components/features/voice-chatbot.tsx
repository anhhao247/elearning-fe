"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bot, X, Send, Loader2, Sparkles, BookOpen, ExternalLink, Mic, MessageSquare, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendAiChatMessage, AiChatResponse } from "@/lib/services/ai.service"
import { getCourseDetail } from "@/lib/services/course.service"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sourcesUsed?: number
  timestamp: Date
  /** Hiển thị nút CTA khi action === CONTINUE_LEARNING */
  ctaLabel?: string
  ctaOnClick?: () => void
}

type VideoState = "normal" | "thinking" | "answer"

interface VoiceChatbotProps {
  courseId?: number
  contentId?: number
  currentLessonTitle?: string
}

export function VoiceChatbot({ courseId, contentId, currentLessonTitle }: VoiceChatbotProps) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  // General State
  const [isOpen, setIsOpen] = useState(false)
  const [chatMode, setChatMode] = useState<"video" | "text">("video")
  
  // Chat History Setup
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Xin chào${user?.firstName ? ` ${user.firstName}` : ""}! 👋 Tôi là trợ lý AI của EduPlatform. Hãy hỏi tôi về các khóa học hoặc nói "Cho tôi học tiếp" để tôi đưa bạn vào bài học nhé!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Voice Extra State
  const [videoState, setVideoState] = useState<VideoState>("normal")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<string>("")
  const [aiReplyText, setAiReplyText] = useState<string>("")

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Utils for Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (isOpen && chatMode === "text") {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, chatMode, scrollToBottom])

  useEffect(() => {
    if (chatMode === "text") {
      scrollToBottom()
    }
  }, [messages, chatMode, scrollToBottom])


  // Stop voice activities when closing globally
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setVideoState("normal")
      setTranscript("")
      setAiReplyText("")
      setIsRecording(false)
    }
  }, [isOpen])

  // Stop audio when switching to text
  useEffect(() => {
    if (chatMode === "text") {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setVideoState("normal")
      setIsRecording(false)
    }
  }, [chatMode])

  // --------------------------------------------------------------------------
  // Handle CONTINUE_LEARNING action
  // --------------------------------------------------------------------------
  const handleContinueLearning = useCallback(async (targetCourseId: number) => {
    setIsNavigating(true)
    toast.loading("Đang tìm bài học cho bạn...", { id: "navigating" })

    try {
      const courseData = await getCourseDetail(targetCourseId)

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

  const buildAiMessage = useCallback(
    (response: AiChatResponse): Message => {
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

      return base
    },
    [handleContinueLearning]
  )

  // --------------------------------------------------------------------------
  // Unified Handle Send
  // --------------------------------------------------------------------------
  const handleSendMessage = async (text: string, isFromVoice: boolean) => {
    if (!text.trim() || isLoading || isNavigating) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    // Luôn luôn thêm vào lịch sử
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    if (isFromVoice) {
      setVideoState("thinking")
      setAiReplyText("Đang xử lý...")
    } else {
      setInput("")
    }

    try {
      const response = await sendAiChatMessage({
        courseId,
        contentId,
        message: text,
        currentLesson: currentLessonTitle,
      })

      const aiMessage = buildAiMessage(response)
      // Thêm câu trả lời vào lịch sử chung
      setMessages((prev) => [...prev, aiMessage])

      if (isFromVoice) {
        setAiReplyText(response.reply)

        // Phát Video Voice
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const audioUrl = `${baseUrl}/v1/ai/tts?text=${encodeURIComponent(response.reply)}`

        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play().catch((err) => {
            console.error("Audio block:", err)
            toast.error("Không thể tự động phát âm thanh.")
            setVideoState("normal")
          })
        }
      }
    } catch {
      toast.error("Không thể kết nối với AI. Vui lòng thử lại.")
      if (isFromVoice) {
        setVideoState("normal")
        setAiReplyText("Lỗi kết nối.")
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      }
    } finally {
      setIsLoading(false)
      if (!isFromVoice) {
        // Tự scroll xuống với text mode
        setTimeout(scrollToBottom, 50)
      }
    }
  }

  // --------------------------------------------------------------------------
  // Voice Request Toggle
  // --------------------------------------------------------------------------
  const toggleRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error("Trình duyệt không hỗ trợ Web Speech API. Vui lòng dùng Chrome.")
      return
    }

    if (isRecording) {
      // Hard stop not fully supported natively without saving instance, relying on user pause for now
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "vi-VN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsRecording(true)
      setTranscript("")
      setAiReplyText("")
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setVideoState("normal")
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      handleSendMessage(text, true)
    }

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        toast.error("Quyền truy cập micro đã bị từ chối.")
      } else {
        toast.error(`Lỗi thu âm: ${event.error}`)
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    try {
      recognition.start()
    } catch (e) {
      console.error(e)
      toast.error("Lỗi khởi tạo micro.")
      setIsRecording(false)
    }
  }, [isRecording, courseId, contentId, currentLessonTitle, handleSendMessage])

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input, false)
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  if (!_hasHydrated || !user) return null

  return (
    <>
      <div
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 z-[1001]",
          "transition-all duration-300 ease-out origin-bottom-right flex flex-col gap-3",
          chatMode === "text" ? "w-[calc(100vw-2rem)] sm:w-[400px]" : "w-[calc(100vw-2rem)] sm:w-[360px]",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        )}
      >
        <div className={cn(
            "flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-card border border-border/50 relative group",
            chatMode === "text" ? "h-[500px] sm:h-[520px]" : ""
        )}>
          {/* Default Header */}
          <div className={cn(
            "flex items-center justify-between px-4 py-3 shrink-0 relative z-10",
            chatMode === "text" ? "bg-gradient-to-r from-violet-600 to-indigo-600" : "bg-gradient-to-b from-black/60 to-transparent absolute top-0 inset-x-0"
          )}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight drop-shadow-md">
                  {chatMode === "text" ? "Trợ lý học tập AI" : "Voice Assistant"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      chatMode === "video" && videoState === "thinking"
                        ? "bg-amber-400"
                        : chatMode === "video" && videoState === "answer"
                        ? "bg-emerald-400"
                        : "bg-emerald-400"
                    )}
                  />
                  <span className={cn(
                      "text-white/80 text-[10px] font-medium drop-shadow-sm",
                      chatMode === "video" ? "uppercase tracking-wider" : ""
                  )}>
                    {chatMode === "video" && videoState === "thinking"
                      ? "Đang suy nghĩ"
                      : chatMode === "video" && videoState === "answer"
                      ? "Đang trả lời"
                      : "Sẵn sàng"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatMode(chatMode === "text" ? "video" : "text")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all backdrop-blur-sm bg-black/10"
                title={chatMode === "text" ? "Chuyển sang Voice 3D" : "Chuyển sang Chat Box"}
              >
                {chatMode === "text" ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW: VIDEO MODE                                          */}
          {/* ========================================================= */}
          {chatMode === "video" && (
            <div className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden">
              <video
                key={videoState}
                src={`/${videoState}.mp4`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
              />

              {/* Recording visualizer */}
              {isRecording && (
                <div className="absolute inset-x-0 bottom-6 flex justify-center items-center z-10 animate-in fade-in zoom-in duration-300">
                  <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
                    <span className="w-1 h-3 bg-red-400 rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.3s]" />
                    <span className="w-1 h-4 bg-red-400 rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.15s]" />
                    <span className="w-1 h-2.5 bg-red-400 rounded-full animate-[bounce_1s_infinite]" />
                    <span className="text-white/90 text-xs ml-2 font-medium">Đang lắng nghe...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: TEXT MODE                                           */}
          {/* ========================================================= */}
          {chatMode === "text" && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth bg-card">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
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

                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
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
                    onKeyDown={handleTextKeyDown}
                    placeholder={courseId ? "Hỏi gì về khóa học này..." : "Hỏi về khóa học hoặc nói 'Học tiếp'..."}
                    rows={1}
                    disabled={isLoading || isNavigating}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[20px] max-h-[100px] py-0.5 disabled:opacity-50"
                    style={{ scrollbarWidth: "none" }}
                  />
                  <button
                    onClick={() => handleSendMessage(input, false)}
                    disabled={!input.trim() || isLoading || isNavigating}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                      input.trim() && !isLoading && !isNavigating
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:opacity-90 hover:scale-105 shadow-md"
                        : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Mode Mic Button & Captions */}
        {chatMode === "video" && (
          <>
            <div className="px-4 pb-0 pt-0 flex items-center justify-center -mt-16 z-20">
              <button
                onClick={toggleRecording}
                disabled={videoState === "thinking"}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-all duration-300 border-[3px]",
                  isRecording
                    ? "bg-red-500 border-red-200 text-white animate-pulse scale-105"
                    : videoState === "thinking"
                    ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-70"
                    : "bg-gradient-to-br from-violet-600 to-indigo-600 border-indigo-200 text-white hover:scale-105 hover:shadow-indigo-500/40"
                )}
              >
                {videoState === "thinking" ? <Loader2 className="w-7 h-7 animate-spin" /> : <Mic className="w-7 h-7" />}
              </button>
            </div>
            
            {transcript && !aiReplyText && (
              <div className="bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-xl flex flex-col gap-2 max-h-[150px] overflow-y-auto w-full mx-auto animate-in slide-in-from-top-2 fade-in">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted-foreground font-medium px-1">Bạn</span>
                  <p className="text-sm bg-muted text-foreground px-3 py-2 rounded-xl rounded-tr-sm">
                    {transcript}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <audio
        ref={audioRef}
        hidden
        onPlay={() => setVideoState("answer")}
        onEnded={() => setVideoState("normal")}
        onError={() => {
          if (chatMode === "video") setVideoState("normal")
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* FAB Button                                                          */}
      {/* ------------------------------------------------------------------ */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-[1000]",
          "w-16 h-16 rounded-full",
          "flex items-center justify-center",
          "bg-transparent overflow-hidden group transition-all duration-300",
          "hover:scale-110 active:scale-95"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300 flex items-center justify-center",
            isOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"
          )}
        >
          <div className="w-24 h-24 flex items-center justify-center shrink-0">
             <DotLottieReact
                src="/chatbot.lottie"
                loop
                autoplay
                className="w-full h-full drop-shadow-xl brightness-110"
             />
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-300 bg-red-500 shadow-xl",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <X className="w-8 h-8 text-white" />
        </div>
      </button>
    </>
  )
}
