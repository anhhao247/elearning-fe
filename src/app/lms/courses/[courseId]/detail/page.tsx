"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  useCourse,
  useCourseDetailStats,
  useCourseReviews,
  useCourseStudentsDetail,
  useCourseQuestions,
} from "@/hooks/queries/use-instructor"
import { useCreateComment } from "@/hooks/queries/use-learning"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Users,
  Star,
  DollarSign,
  MessageCircleQuestion,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Loader2,
  Reply,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`
  return `${amount.toLocaleString("vi-VN")} ₫`
}

function timeAgo(date: string) {
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi })
  } catch {
    return date
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-4 h-4",
            s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"
          )}
        />
      ))}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  loading?: boolean
}) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

// ─── Tabs content ────────────────────────────────────────────────────────────

function QuestionsTab({ courseId }: { courseId: string }) {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<'UNANSWERED' | 'ANSWERED'>('UNANSWERED')
  const { data, isLoading } = useCourseQuestions(courseId, page, 10, status)
  const questions = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['UNANSWERED', 'ANSWERED'] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={status === option ? 'secondary' : 'outline'}
                onClick={() => {
                  setStatus(option)
                  setPage(0)
                }}
                className="rounded-full px-3 py-2 text-sm"
              >
                {option === 'UNANSWERED' ? 'Chưa trả lời' : 'Đã trả lời'}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{totalElements} câu hỏi</p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-2xl text-muted-foreground gap-2">
          <MessageCircleQuestion className="w-8 h-8" />
          <p className="text-sm">Không có câu hỏi nào phù hợp với bộ lọc.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['UNANSWERED', 'ANSWERED'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={status === option ? 'secondary' : 'outline'}
              onClick={() => {
                setStatus(option)
                setPage(0)
              }}
              className="rounded-full px-3 py-2 text-sm"
            >
              {option === 'UNANSWERED' ? 'Chưa trả lời' : 'Đã trả lời'}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{totalElements} câu hỏi</p>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionItem
            key={q.commentId}
            question={q}
            courseId={courseId}
            page={page}
            status={status}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  )
}

interface QuestionItemProps {
  question: {
    commentId: number
    commentContent: string
    studentId: number
    studentUsername: string
    contentId: number
    contentTitle: string
    createdAt: string
    updatedAt: string
    isAnswered: boolean
  }
  courseId: string
  page: number
  status: 'UNANSWERED' | 'ANSWERED'
}

function QuestionItem({ question, courseId, page, status }: QuestionItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const createCommentMutation = useCreateComment(question.contentId)
  const queryClient = useQueryClient()

  const handleReply = async () => {
    if (!replyText.trim()) return

    try {
      await createCommentMutation.mutateAsync({
        commentContent: replyText,
        parentId: question.commentId,
      })
      setReplyText("")
      setIsReplying(false)
      toast.success("Phản hồi đã được gửi")
      queryClient.invalidateQueries({ queryKey: ['course-questions', courseId, page, 10, status] })
    } catch (error) {
      toast.error("Không thể gửi phản hồi. Vui lòng thử lại.")
    }
  }

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
            {question.studentUsername?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{question.studentUsername}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 rounded-full font-normal text-slate-500"
                >
                  {question.contentTitle}
                </Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {question.isAnswered ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] h-5 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã trả lời
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px] h-5 gap-1">
                    <Clock className="w-3 h-3" />
                    Chờ trả lời
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">{timeAgo(question.createdAt)}</span>
              </div>
            </div>
            <p className="text-sm mt-1.5 text-slate-700 leading-relaxed">{question.commentContent}</p>

            <div className="flex items-center gap-3 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsReplying((prev) => !prev)}
                className="rounded-full px-3"
              >
                <Reply className="w-3.5 h-3.5" />
                Trả lời
              </Button>
            </div>

            {isReplying && (
              <div className="mt-4 flex flex-col gap-3">
                <Textarea
                  placeholder="Nhập nội dung trả lời của giảng viên..."
                  className="min-h-[110px] rounded-2xl resize-none border-slate-200"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsReplying(false)}
                    className="rounded-full"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    disabled={!replyText.trim() || createCommentMutation.isPending}
                    onClick={handleReply}
                    className="rounded-full"
                  >
                    {createCommentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Gửi trả lời
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewsTab({ courseId }: { courseId: string }) {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useCourseReviews(courseId, page)
  const reviews = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-2xl text-muted-foreground gap-2">
        <Star className="w-8 h-8" />
        <p className="text-sm">Chưa có đánh giá nào.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id} className="rounded-xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs uppercase">
                {r.username?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{r.username}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && (
                  <p className="text-sm mt-1.5 text-slate-700 leading-relaxed">{r.comment}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  )
}

function StudentsTab({ courseId }: { courseId: string }) {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useCourseStudentsDetail(courseId, page)
  const students = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-2xl text-muted-foreground gap-2">
        <Users className="w-8 h-8" />
        <p className="text-sm">Chưa có học viên nào đăng ký.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="px-4 py-3">Học viên</TableHead>
            <TableHead className="px-4 py-3">Ngày đăng ký</TableHead>
            <TableHead className="px-4 py-3">Tiến độ</TableHead>
            <TableHead className="px-4 py-3">Trạng thái</TableHead>
            <TableHead className="px-4 py-3 text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => {
            const statusLabel = s.completedAt ? 'Hoàn thành' : 'Đang học'
            return (
              <TableRow key={s.userId}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shrink-0">
                      <AvatarImage src={s.avatar || ""} alt={s.fullName} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-sm">
                        {s.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{s.fullName}</p>
                      <p className="text-xs text-slate-500">ID: {s.userId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">{format(new Date(s.enrolledAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${s.progressPercent}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{s.progressPercent}%</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={s.completedAt ? 'default' : 'outline'} className="rounded-full text-xs py-1 px-2">
                    {statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" asChild className="rounded-full">
                    <Link href={`/lms/students/${s.userId}`}>Xem chi tiết</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="px-4 py-3 border-t bg-slate-50">
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const { data: course, isLoading: courseLoading } = useCourse(courseId)
  const { data: stats, isLoading: statsLoading } = useCourseDetailStats(courseId)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          {courseLoading ? (
            <Skeleton className="h-7 w-64" />
          ) : (
            <h1 className="text-xl font-bold tracking-tight truncate">{course?.title}</h1>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">Thống kê & quản lý khóa học</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Học viên"
          value={(stats?.totalStudents ?? 0).toLocaleString()}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          loading={statsLoading}
        />
        <StatCard
          label="Doanh thu"
          value={formatVND(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          loading={statsLoading}
        />
        <StatCard
          label="Đánh giá TB"
          value={
            stats?.averageRating
              ? `${stats.averageRating.toFixed(1)} ★`
              : "—"
          }
          icon={Star}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          loading={statsLoading}
        />
        <StatCard
          label="Tổng đánh giá"
          value={(stats?.totalReviews ?? 0).toLocaleString()}
          icon={MessageSquare}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          loading={statsLoading}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
          {[
            { value: "questions", label: "Câu hỏi", icon: MessageCircleQuestion },
            { value: "reviews", label: "Đánh giá", icon: Star },
            { value: "students", label: "Học viên", icon: Users },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                flex items-center gap-2 rounded-none border-b-2 border-transparent
                py-3 px-2 text-sm font-normal text-muted-foreground
                data-[state=active]:border-primary data-[state=active]:text-primary
                data-[state=active]:bg-primary/5 data-[state=active]:font-medium
                data-[state=active]:shadow-none hover:text-foreground transition-colors
              "
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          <QuestionsTab courseId={courseId} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <ReviewsTab courseId={courseId} />
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          <StudentsTab courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
