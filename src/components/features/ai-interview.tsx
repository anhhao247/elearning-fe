"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Camera, CameraOff, LogOut, Video as VideoIcon, Send, Play, BarChart3, CheckCircle2, AlertTriangle, Lightbulb, UserCircle, Rocket, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateInterviewQuestion, evaluateInterviewSession, QAPair, EvaluationResult } from "@/lib/services/ai.service"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type VideoState = "listen" | "response"
type InterviewPhase = "setup" | "interviewing" | "evaluating" | "report"
type Difficulty = "dễ" | "trung bình" | "khó"

interface AiInterviewProps {
  slug: string
  contentId: number
}

export function AiInterview({ slug, contentId }: AiInterviewProps) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  // -- Master States --
  const [phase, setPhase] = useState<InterviewPhase>("setup")
  const [config, setConfig] = useState<{ difficulty: Difficulty; questionCount: number }>({
    difficulty: "trung bình",
    questionCount: 3,
  })
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)

  // -- UI States --
  const [messages, setMessages] = useState<Message[]>([])
  const [videoState, setVideoState] = useState<VideoState>("listen")
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputText, setInputText] = useState("")

  // Timer State
  const [seconds, setSeconds] = useState(0)

  // Extract courseId
  const courseId = useMemo(() => {
    const parts = slug.split("-")
    const id = Number(parts[parts.length - 1])
    return isNaN(id) ? 0 : id
  }, [slug])

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const webcamRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const accumulatedTranscriptRef = useRef("")

  // Timer
  useEffect(() => {
    if (phase !== "interviewing") return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [seconds])

  // Fake Progress based on Qs asked out of target config
  const progressPercent = useMemo(() => {
    const questionsAsked = qaPairs.length + (currentQuestion ? 1 : 0)
    const total = config.questionCount
    if (total === 0) return 0
    return Math.min(Math.round((questionsAsked / total) * 100), 100)
  }, [qaPairs, currentQuestion, config.questionCount])

  // Force scroll to top on mount to prevent Next.js from preserving scroll position from previous page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Auto-scroll chat (only if there are messages)
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [messages])

  // Auto-expand textarea
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "20px"
      const scrollHeight = chatInputRef.current.scrollHeight
      chatInputRef.current.style.height = `${Math.min(scrollHeight, 100)}px`
    }
  }, [inputText])

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // --------------------------------------------------------------------------
  // Camera Handling
  // --------------------------------------------------------------------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
      }
      setIsCameraOn(true)
    } catch (err) {
      console.error("Camera access denied", err)
      setIsCameraOn(false)
      toast.error("Không thể mở Camera.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }

  const toggleCamera = () => {
    if (isCameraOn) stopCamera()
    else startCamera()
  }

  // Start camera on mount
  useEffect(() => {
    startCamera()
  }, [])

  // --------------------------------------------------------------------------
  // AI Flow Controls
  // --------------------------------------------------------------------------

  const fetchNextQuestion = async (existingPairs: QAPair[]) => {
    setIsLoading(true)
    try {
      const response = await generateInterviewQuestion({
        userId: user!.id,
        courseId,
        difficulty: config.difficulty,
        previousQuestions: existingPairs.map(q => q.question)
      })

      setCurrentQuestion(response.question)

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.question,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])

      // Play audio TTS
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const audioUrl = `${baseUrl}/v1/ai/tts?text=${encodeURIComponent(response.question)}`

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(e => {
          console.error("Autoplay blocked", e)
          setVideoState("listen")
        })
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối hệ thống. Vui lòng thử lại sau.")
      setVideoState("listen")
    } finally {
      setIsLoading(false)
    }
  }

  const startInterview = () => {
    setPhase("interviewing")
    setQaPairs([])
    setMessages([])
    setSeconds(0)

    // Initial greeting if wanted, or jump directly to question 1
    const greetingMsg: Message = {
      id: "welcome",
      role: "assistant",
      content: `Tuyệt vời, phiên Vấn đáp (${config.questionCount} câu - Độ khó: ${config.difficulty}) xin phép được bắt đầu!`,
      timestamp: new Date()
    }
    setMessages([greetingMsg])

    // Wait a brief moment before first question fetch for dramatic effect
    setTimeout(() => {
      fetchNextQuestion([])
    }, 1500)
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    if (!currentQuestion) {
      toast.info("Vui lòng chờ câu hỏi tiếp theo từ AI.")
      return
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true) // Disable input locally while processing states

    // Combine history
    const newQaPairs = [...qaPairs, { question: currentQuestion, answer: text }]
    setQaPairs(newQaPairs)
    setCurrentQuestion(null)

    if (newQaPairs.length >= config.questionCount) {
      // Evaluate Phase
      setPhase("evaluating")
      try {
        const res = await evaluateInterviewSession({
          userId: user!.id,
          courseId,
          qaPairs: newQaPairs
        })
        setEvaluation(res.evaluation)
        setPhase("report")
      } catch (err) {
        toast.error("Đã có sự cố khi chấm điểm. Vui lòng thoát ra.")
        setIsLoading(false)
      }
    } else {
      // Small artificially delay so user sees their message printed quickly before loading Next Question
      setTimeout(() => {
        fetchNextQuestion(newQaPairs)
      }, 500)
    }
  }

  // --------------------------------------------------------------------------
  // Microphone / Speech Recognition
  // --------------------------------------------------------------------------
  const toggleRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Trình duyệt không hỗ trợ Voice. Vui lòng dùng Chrome.")
      return
    }

    if (isRecording) {
      // STOP RECORDING
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      return
    }

    // START RECORDING
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "vi-VN"
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    accumulatedTranscriptRef.current = ""

    recognition.onstart = () => {
      setIsRecording(true)
      setTranscript("")
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setVideoState("listen")
    }

    recognition.onresult = (event: any) => {
      let interim = ""
      let finalized = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalized += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }

      const totalSoFar = accumulatedTranscriptRef.current + finalized
      if (finalized) accumulatedTranscriptRef.current = totalSoFar
      
      setTranscript(totalSoFar + (interim ? " " + interim : ""))
    }

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error)
      if (event.error !== "no-speech") {
        toast.error("Lỗi thu âm hoặc quyền bị từ chối.")
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      const finalResult = accumulatedTranscriptRef.current.trim()
      if (finalResult) {
        handleSendMessage(finalResult)
      }
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch {
      toast.error("Lỗi khởi tạo micro.")
      setIsRecording(false)
    }
  }, [isRecording, courseId, contentId, currentQuestion, qaPairs, handleSendMessage])


  if (!_hasHydrated || !user) return null

  return (
    <div className="h-[calc(100vh-70px)] bg-slate-50 flex items-center justify-center p-2 lg:p-3 overflow-hidden relative">

      {/* RENDER NORMAL LAYOUT */}
      <div className={cn(
        "w-full h-full max-w-[1500px] flex flex-col lg:flex-row gap-3 overflow-hidden transition-all duration-700",
        (phase === "report") ? "opacity-0 pointer-events-none scale-95" : "opacity-100" // Hide raw layout if report
      )}>

        {/* L E F T  P A N E L (Video & Controls) - 60% width on desktop */}
        <div className="lg:w-[60%] flex flex-col h-full gap-3 overflow-hidden relative">

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex items-center gap-3 shrink-0 relative z-10">
            <div className="bg-primary/10 p-1.5 rounded-lg pointer-events-none">
              <VideoIcon className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-bold text-sm md:text-base text-slate-800">
              Vấn đáp: <span className="text-primary font-semibold">Khóa học hiện tại</span>
            </h1>
          </div>

          {/* Main Video Box */}
          <div className="relative flex-1 bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200/50 flex items-center justify-center min-h-[40vh] lg:min-h-0">
            {/* AI Video (Large) */}
            <video
              key={videoState}
              src={`/interview_chatbot_${videoState}.mp4`}
              autoPlay loop muted playsInline
              className={cn(
                "h-full w-full object-cover transition-all duration-700",
                (phase === "setup" || phase === "evaluating") ? "opacity-30 blur-sm grayscale-[50%]" : "opacity-100"
              )}
            />

            {/* SETUP PHASE OVERLAY */}
            {phase === "setup" && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white/95 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/20 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-primary text-transparent bg-clip-text mb-2 text-center">Thiết lập Vấn đáp</h2>
                  <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">Hãy lựa chọn cấu trúc buổi phỏng vấn để AI sắp xếp lộ trình phù hợp với bạn.</p>

                  <div className="w-full space-y-5">
                    {/* Size selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Số lượng câu hỏi</label>
                      <div className="flex gap-2">
                        {[
                          { lbl: "Nhanh", val: 3 },
                          { lbl: "Tiêu chuẩn", val: 5 },
                          { lbl: "Toàn diện", val: 10 }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => setConfig(p => ({ ...p, questionCount: opt.val }))}
                            className={cn(
                              "flex-1 py-2 text-sm font-medium rounded-xl border transition-all cursor-pointer outline-none",
                              config.questionCount === opt.val
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}>
                            <div className="font-bold">{opt.val}</div>
                            <div className="text-[10px] opacity-70">{opt.lbl}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Mức độ tương tác</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["dễ", "trung bình", "khó"].map(diff => (
                          <button
                            key={diff}
                            onClick={() => setConfig(p => ({ ...p, difficulty: diff as Difficulty }))}
                            className={cn(
                              "py-2 px-1 text-xs font-medium rounded-xl border transition-all uppercase cursor-pointer outline-none",
                              config.difficulty === diff
                                ? "bg-orange-50 border-orange-400 text-orange-700 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}>
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={startInterview}
                      className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-[0.98]">
                      <Play className="w-4 h-4 fill-current" />
                      Bắt đầu cuộc gọi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EVALUATING PHASE SPINNER */}
            {phase === "evaluating" && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur text-white flex-col gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="font-bold text-lg">Đang tổng hợp Báo cáo...</h3>
                <p className="text-sm opacity-80 text-center max-w-sm">Alex đang phân tích câu trả lời của bạn qua công nghệ AI. Quá trình này sẽ mất vài giây.</p>
              </div>
            )}

            {/* User Webcam (Small PIP) */}
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[160px] aspect-video bg-zinc-800 rounded-lg overflow-hidden shadow-xl border border-white/20 z-20">
              {isCameraOn ? (
                <video
                  ref={webcamRef}
                  autoPlay playsInline muted
                  className="w-full h-full object-cover origin-center scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-900">
                  <CameraOff className="w-6 h-6 opacity-50" />
                </div>
              )}
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-6 right-6 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-2 flex items-center justify-between gap-4 z-40">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCamera}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all outline-none font-bold text-xs border shadow-sm",
                    isCameraOn ? "text-slate-700 bg-white hover:bg-slate-50 border-slate-100" : "text-red-600 bg-red-50 border-red-100 hover:bg-red-100"
                  )}
                >
                  {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isCameraOn ? "Camera" : "Bật Cam"}</span>
                </button>

                <button
                  onClick={toggleRecording}
                  disabled={isLoading || phase !== "interviewing"}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all outline-none font-bold text-xs border shadow-sm min-w-[110px]",
                    (isLoading || phase !== "interviewing") ? "opacity-50 cursor-not-allowed" : "",
                    isRecording
                      ? "text-red-600 bg-red-50 border-red-200 animate-pulse"
                      : "text-slate-700 bg-white hover:bg-slate-50 border-slate-100"
                  )}
                >
                  {isRecording ? <Mic className="w-4 h-4 text-red-500" /> : <MicOff className="w-4 h-4" />}
                  <span>{isRecording ? "Dừng & Gửi" : "Thu âm"}</span>
                </button>
              </div>

              <div className="w-px h-8 bg-slate-200 mx-1 hidden lg:block" />

              <button
                onClick={() => router.push(`/courses/learning/${slug}/${contentId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Rời đi</span>
              </button>
            </div>
          </div>
        </div>

        {/* R I G H T  P A N E L (Chat & Progress) - 40% Width */}
        <div className="lg:w-[40%] flex flex-col h-full gap-3 overflow-hidden">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-4 text-white shadow-md shrink-0 border border-blue-400/30">
            <h3 className="font-bold text-sm mb-2">Tiến trình vấn đáp</h3>

            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs font-medium opacity-90">
                <span>{progressPercent}%</span>
                <span>100%</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative">
                <div className="h-full bg-white rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs bg-white/10 px-3 py-2 rounded-lg border border-white/20 font-medium">
              <span className="opacity-90">Thời gian:</span>
              <span className="text-sm font-bold font-mono tracking-wider">{formattedTime}</span>
            </div>
          </div>

          {/* Chat History Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden pointer-events-auto">
            <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-xs tracking-wide uppercase">Lịch sử hội thoại</h3>
              {phase === "interviewing" && currentQuestion && (
                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold">Câu hỏi {qaPairs.length + 1}/{config.questionCount}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {msg.role === "assistant" && (
                      <>
                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-sm shrink-0 bg-white">
                          <img
                            src="/interview_chatbot_avatar.png"
                            alt="Alex Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Alex</span>
                      </>
                    )}
                  </div>
                  <div className={cn(
                    "px-3.5 py-2 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-slate-50 border border-slate-200/60 text-slate-800 rounded-tl-sm font-medium"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-1">
                  <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-slate-200 shrink-0 bg-white mt-1">
                    <img
                      src="/interview_chatbot_avatar.png"
                      alt="Alex Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {transcript && !isLoading && videoState === "listen" && (
                <div className="flex flex-col items-end gap-1 opacity-60">
                  <div className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 rounded-tr-sm border border-indigo-100 italic text-xs shadow-sm">
                    {transcript} ...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1 text-transparent">-</div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-white flex items-end gap-2 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)]">
              <textarea
                ref={chatInputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (inputText.trim()) {
                      handleSendMessage(inputText)
                      setInputText("")
                    }
                  }
                }}
                placeholder={isLoading ? "Alex đang xem xét..." : "Nhập câu trả lời..."}
                className="flex-1 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 shadow-inner text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 resize-none min-h-[38px] max-h-[100px]"
                rows={1}
                disabled={isLoading || isRecording || phase !== "interviewing" || !currentQuestion}
              />
              <button
                onClick={() => {
                  if (inputText.trim()) {
                    handleSendMessage(inputText)
                    setInputText("")
                  }
                }}
                disabled={!inputText.trim() || isLoading || isRecording || phase !== "interviewing" || !currentQuestion}
                className="p-2.5 rounded-full bg-primary text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-sm mb-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* R E P O R T   P H A S E   (Full Screen Overlay inside container) */}
      {phase === "report" && evaluation && (
        <div className="absolute inset-4 lg:inset-8 z-50 bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-100">

          {/* Left Report Panel */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-900 to-indigo-950 p-8 flex flex-col items-center justify-center text-white text-center">
            <UserCircle className="w-20 h-20 text-indigo-300 opacity-50 mb-4" />
            <h2 className="text-2xl font-bold mb-1">Báo Cáo Tổng Kết</h2>
            <p className="text-indigo-200 text-sm mb-10">Đánh giá quá trình Vấn đáp AI</p>

            <div className="relative mb-6">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                <circle
                  cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * evaluation.overall_score) / 10}
                  className={cn(
                    "transition-all duration-1000",
                    evaluation.overall_score >= 8 ? "text-green-400" : evaluation.overall_score >= 5 ? "text-yellow-400" : "text-red-400"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tighter">{evaluation.overall_score}</span>
                <span className="text-xs uppercase tracking-widest opacity-60">/10</span>
              </div>
            </div>

            <p className="text-sm px-4 opacity-90 italic">"{evaluation.overall_feedback}"</p>
          </div>

          {/* Right Report Panel */}
          <div className="w-full md:w-2/3 bg-slate-50 p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="text-primary w-6 h-6" /> Chi tiết kỹ năng
            </h3>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin">

              {/* Strengths */}
              <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                <h4 className="font-bold text-green-700 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 fill-green-100" /> Điểm mạnh
                </h4>
                <ul className="space-y-2">
                  {evaluation.strengths.map((str, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      {str}
                    </li>
                  ))}
                  {evaluation.strengths.length === 0 && <li className="text-sm text-slate-500 italic">Không có dữ liệu rõ ràng.</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
                <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 fill-orange-100" /> Điểm cần cải thiện
                </h4>
                <ul className="space-y-2">
                  {evaluation.weaknesses.map((weak, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      {weak}
                    </li>
                  ))}
                  {evaluation.weaknesses.length === 0 && <li className="text-sm text-slate-500 italic">Không tìm thấy yếu điểm nào đáng kể!</li>}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 fill-blue-100" /> Lời khuyên
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">{evaluation.suggestions}</p>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-6 mt-auto border-t border-slate-200 flex justify-end">
              <button
                onClick={() => router.push(`/courses/learning/${slug}/${contentId}`)}
                className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-primary/20 transition-all"
              >
                Hoàn tất & Về trang học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden TTS Audio Element */}
      <audio
        ref={audioRef}
        hidden
        onPlay={() => setVideoState("response")}
        onEnded={() => setVideoState("listen")}
      />
    </div>
  )
}
