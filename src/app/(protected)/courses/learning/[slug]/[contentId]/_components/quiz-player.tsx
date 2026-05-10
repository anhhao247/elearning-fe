"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { getQuizByContentId, submitQuiz } from "@/lib/services/learning.service"
import { 
  QuizFetchResponse, 
  QuizQuestion, 
  QuizResultResponse,
  QuizSubmissionPayload 
} from "@/types/learning"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface QuizPlayerProps {
  contentId: number
  title: string
}

type QuizState = "INTRO" | "TAKING" | "RESULT"

const STORAGE_KEY_PREFIX = "quiz_progress_"

export function QuizPlayer({ contentId, title }: QuizPlayerProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [quizState, setQuizState] = useState<QuizState>("INTRO")
  const [quizData, setQuizData] = useState<QuizFetchResponse | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, number[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResultResponse | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const storageKey = `${STORAGE_KEY_PREFIX}${contentId}`

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey)
    if (savedProgress) {
      try {
        const { state, data, answers, remainingTime, result: savedResult } = JSON.parse(savedProgress)
        setQuizData(data)
        setUserAnswers(answers || {})
        setTimeRemaining(remainingTime || 0)
        setQuizState(state)
        setResult(savedResult || null)
      } catch (e) {
        console.error("Failed to parse saved quiz progress", e)
      }
    }
  }, [storageKey])

  // Save progress to localStorage
  useEffect(() => {
    if (quizState !== "INTRO") {
      const progress = {
        state: quizState,
        data: quizData,
        answers: userAnswers,
        remainingTime: timeRemaining,
        result: result
      }
      localStorage.setItem(storageKey, JSON.stringify(progress))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [quizState, quizData, userAnswers, timeRemaining, result, storageKey])

  const handleStartQuiz = async () => {
    try {
      setIsLoading(true)
      const data = await getQuizByContentId(contentId)
      setQuizData(data)
      setTimeRemaining(data.quizDuration * 60)
      setUserAnswers({})
      setQuizState("TAKING")
    } catch (error) {
      toast.error("Không thể tải thông tin bài kiểm tra.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !quizData || !user) return
    
    setIsSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const payload: QuizSubmissionPayload = {
        answers: quizData.questions.map(q => ({
          questionId: q.questionId,
          chosenOptionIds: userAnswers[q.questionId] || []
        }))
      }

      const res = await submitQuiz(contentId, user.id, payload)
      setResult(res)
      setQuizState("RESULT")
      toast.success("Đã nộp bài thành công!")
      // Progress will be cleared by the cleanup effect of quizState === "INTRO" in real-world but here we stay in RESULT
      // We manually clear it if we want, or keep it for review.
    } catch (error) {
      toast.error("Nộp bài thất bại. Vui lòng thử lại.")
      // Restart timer if submission failed? Maybe not.
    } finally {
      setIsSubmitting(false)
    }
  }, [contentId, user, quizData, userAnswers, isSubmitting])

  // Timer effect
  useEffect(() => {
    if (quizState === "TAKING" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizState, timeRemaining, handleSubmit])

  const handleOptionToggle = (questionId: number, optionId: number, type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE") => {
    setUserAnswers((prev) => {
      const current = prev[questionId] || []
      if (type === "SINGLE_CHOICE") {
        return { ...prev, [questionId]: [optionId] }
      } else {
        const next = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
        return { ...prev, [questionId]: next }
      }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleRetry = () => {
    localStorage.removeItem(storageKey)
    setQuizState("INTRO")
    setResult(null)
    setUserAnswers({})
    setQuizData(null)
  }

  if (quizState === "INTRO") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sẵn sàng để thử thách?</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto mt-2">
              Bài kiểm tra giúp bạn hệ thống lại kiến thức đã học. Đảm bảo bạn có đủ thời gian và không gian yên tĩnh.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
            <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian làm bài</p>
                <p className="font-bold underline decoration-blue-500/30 underline-offset-4">30 phút</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Điểm đạt tối thiểu</p>
                <p className="font-bold underline decoration-emerald-500/30 underline-offset-4">80% điểm</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 p-8 flex justify-center">
            <Button 
              size="lg" 
              className="px-12 font-bold text-lg h-14 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
              onClick={handleStartQuiz}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang chuẩn bị...
                </>
              ) : "Bắt đầu bài kiểm tra ngay"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizState === "TAKING" && quizData) {
    return (
      <div className="flex flex-col gap-6 relative">
        <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur-md py-4 border-b">
          <div>
            <h1 className="text-xl md:text-2xl font-bold truncate max-w-[200px] md:max-w-md">{title}</h1>
            <p className="text-sm text-muted-foreground">Chọn đáp án đúng nhất cho mỗi câu hỏi</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border-2 font-mono font-bold text-lg",
            timeRemaining < 60 ? "border-rose-500 text-rose-500 animate-pulse" : "border-primary/20 text-primary"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="space-y-8 pb-32">
          {quizData.questions.map((q, idx) => (
            <Card key={q.questionId} className="border-border/60 shadow-sm overflow-hidden group hover:border-primary/30 transition-colors">
              <CardHeader className="bg-muted/20">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-snug">{q.questionText}</CardTitle>
                    <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">
                      {q.questionType === "SINGLE_CHOICE" ? "Chọn 1 đáp án" : "Chọn nhiều đáp án"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {q.options.map((opt) => {
                    const isChecked = (userAnswers[q.questionId] || []).includes(opt.optionId)
                    return (
                      <div 
                        key={opt.optionId}
                        className={cn(
                          "flex items-center gap-4 p-4 md:p-5 transition-colors cursor-pointer hover:bg-muted/50",
                          isChecked && "bg-primary/5"
                        )}
                        onClick={() => handleOptionToggle(q.questionId, opt.optionId, q.questionType)}
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          {q.questionType === "SINGLE_CHOICE" ? (
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                              isChecked ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                              {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          ) : (
                            <Checkbox 
                              checked={isChecked}
                              onCheckedChange={() => handleOptionToggle(q.questionId, opt.optionId, q.questionType)}
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                        <Label 
                          className="flex-1 cursor-pointer text-[15px] font-medium leading-relaxed select-none"
                        >
                          {opt.optionText}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-background/95 backdrop-blur-md p-4 md:p-6 border-t md:border-none flex justify-center md:justify-end z-30 mb-6 rounded-b-xl overflow-hidden">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-12 font-bold h-12 shadow-xl"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang chấm điểm...
              </>
            ) : "Nộp bài kiểm tra"}
          </Button>
        </div>
      </div>
    )
  }

  if (quizState === "RESULT" && result && quizData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Kết quả bài làm</h1>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại khóa học
          </Button>
        </div>

        <Card className={cn(
          "shadow-lg border-2 overflow-hidden",
          result.isPassed ? "border-emerald-500/50 bg-emerald-50/5 dark:bg-emerald-500/5" : "border-rose-500/50 bg-rose-50/5 dark:bg-rose-500/5"
        )}>
          <CardHeader className="text-center py-10 space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-2 bg-background">
              {result.isPassed ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              ) : (
                <XCircle className="w-16 h-16 text-rose-500" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-4xl font-black">{result.score.toFixed(1)}%</CardTitle>
              <CardDescription className="text-lg font-medium">
                {result.isPassed ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Chúc mừng! Bạn đã vượt qua bài kiểm tra.</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">Rất tiếc! Bạn chưa đạt mức điểm yêu cầu.</span>
                )}
              </CardDescription>
            </div>
            <div className="flex justify-center gap-4 text-sm font-medium">
              <Badge variant="outline" className="px-4 py-1.5 bg-background shadow-sm">Yêu cầu: {quizData.passPercent}%</Badge>
              <Badge variant={result.isPassed ? "success" : "destructive"} className="px-4 py-1.5 shadow-sm">
                Trạng thái: {result.isPassed ? "Đạt" : "Không đạt"}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="bg-background/50 border-t p-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 font-bold" onClick={() => router.push('/courses/learning/' + contentId)}>
              Tiếp tục bài tiếp theo
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 font-bold" onClick={handleRetry}>
              <RotateCcw className="w-4 h-4 mr-2" /> Làm lại bài kiểm tra
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" /> Chi tiết bài làm
          </h2>
          {quizData.questions.map((q, idx) => {
            const userSelections = userAnswers[q.questionId] || []
            const correctIds = result.correctAnswers.find(ca => ca.questionId === q.questionId)?.correctOptionIds || []
            const isCorrect = userSelections.length === correctIds.length && 
                              userSelections.every(id => correctIds.includes(id))

            return (
              <Card key={q.questionId} className={cn(
                "border-l-4 transition-all",
                isCorrect ? "border-l-emerald-500" : "border-l-rose-500"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-muted-foreground mt-1">Câu {idx + 1}:</span>
                    <CardTitle className="text-[17px] leading-relaxed">{q.questionText}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {q.options.map((opt) => {
                      const isUserSelected = userSelections.includes(opt.optionId)
                      const isCorrectOption = correctIds.includes(opt.optionId)
                      
                      return (
                        <div 
                          key={opt.optionId}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-sm transition-all animate-in fade-in slide-in-from-left-2 duration-300",
                            isCorrectOption && "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                            isUserSelected && !isCorrectOption && "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400",
                            !isUserSelected && !isCorrectOption && "bg-muted/10 border-border/50 text-muted-foreground"
                          )}
                        >
                          <div className="shrink-0">
                            {isCorrectOption ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isUserSelected ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-current opacity-20" />
                            )}
                          </div>
                          <span className="flex-1 font-medium">{opt.optionText}</span>
                          {isUserSelected && (
                            <Badge variant="outline" className="text-[10px] bg-background">Lựa chọn của bạn</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
}
