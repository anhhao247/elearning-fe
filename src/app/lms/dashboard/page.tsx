"use client"

import {
  Users,
  BookOpen,
  DollarSign,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Video,
  FileText,
  HelpCircle,
  Star,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  useDashboardStats,
  useRecentEnrollments,
  usePendingSync,
  useCourseStats,
} from "@/hooks/queries/use-instructor"
import { cn } from "@/lib/utils"

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`
  return `${amount.toLocaleString("vi-VN")} ₫`
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}


function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function contentTypeIcon(type: string) {
  switch (type) {
    case "VIDEO":   return <Video className="w-3.5 h-3.5" />
    case "READING": return <FileText className="w-3.5 h-3.5" />
    case "QUIZ":    return <HelpCircle className="w-3.5 h-3.5" />
    default:        return <FileText className="w-3.5 h-3.5" />
  }
}

function contentTypeColor(type: string) {
  switch (type) {
    case "VIDEO":   return "bg-blue-50 text-blue-600 border-blue-100"
    case "READING": return "bg-emerald-50 text-emerald-600 border-emerald-100"
    case "QUIZ":    return "bg-purple-50 text-purple-600 border-purple-100"
    default:        return "bg-slate-50 text-slate-600"
  }
}

function isPositiveChange(change: string) {
  return change.startsWith("+")
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ElementType
  iconClass: string
  bgClass: string
  loading?: boolean
}

function StatCard({ title, value, change, icon: Icon, iconClass, bgClass, loading }: StatCardProps) {
  const isPositive = isPositiveChange(change)
  return (
    <Card className="relative overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            )}
            {loading ? (
              <Skeleton className="h-4 w-36 mt-1" />
            ) : (
              <p className={cn(
                "text-xs font-medium flex items-center gap-1",
                isPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {isPositive
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-2xl", bgClass)}>
            <Icon className={cn("w-6 h-6", iconClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Chart Config ──────────────────────────────────────────────────────────

const courseChartConfig = {
  students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
  revenue: { label: "Doanh thu (nghìn ₫)", color: "hsl(142, 71%, 45%)" },
} satisfies ChartConfig

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: enrollments, isLoading: enrollmentsLoading } = useRecentEnrollments()
  const { data: pendingSync, isLoading: pendingLoading } = usePendingSync()
  const { data: courseStats, isLoading: courseStatsLoading } = useCourseStats()

  const chartData = courseStats?.map((c) => ({
    name: c.courseName.length > 16 ? c.courseName.slice(0, 16) + "…" : c.courseName,
    students: c.studentCount,
    revenue: Math.round(c.revenue / 1000),
  })) ?? []

  const statCards = [
    {
      title: "Tổng học viên",
      value: stats?.totalStudents ?? 0,
      change: stats?.totalStudentsChange ?? "",
      icon: Users,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      title: "Khóa học đang hoạt động",
      value: stats?.activeCourses ?? 0,
      change: stats?.activeCoursesChange ?? "",
      icon: BookOpen,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      title: "Tổng doanh thu",
      value: formatVND(stats?.totalRevenue ?? 0),
      change: stats?.totalRevenueChange ?? "",
      icon: DollarSign,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      title: "Nội dung chờ đồng bộ AI",
      value: stats?.pendingSyncContent ?? 0,
      change: stats?.pendingSyncContentChange ?? "",
      icon: Sparkles,
      iconClass: "text-violet-600",
      bgClass: "bg-violet-50",
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Tổng quan hoạt động giảng dạy của bạn.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* ── Middle Row: Chart + Pending Sync ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Hiệu suất khóa học</CardTitle>
            <CardDescription>Số học viên theo từng khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            {courseStatsLoading ? (
              <div className="flex gap-3 items-end h-48">
                {[60, 90, 45, 80, 55].map((h, i) => (
                  <Skeleton key={i} className="flex-1 rounded" style={{ height: h }} />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu khóa học
              </div>
            ) : (
              <ChartContainer config={courseChartConfig} className="h-52 w-full">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]} fill="hsl(221, 83%, 53%)" name="students" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pending Sync */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Chờ đồng bộ AI
              </CardTitle>
              {pendingSync && pendingSync.length > 0 && (
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 rounded-full px-2 py-0.5 text-xs font-bold">
                  {pendingSync.length}
                </Badge>
              )}
            </div>
            <CardDescription>Nội dung chưa được đồng bộ với AI</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pendingLoading ? (
              <div className="space-y-2 px-6 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : !pendingSync || pendingSync.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Tất cả đã được đồng bộ!</p>
                <p className="text-xs text-slate-400 mt-1">Không có nội dung nào chờ xử lý.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {pendingSync.map((item) => (
                  <li key={item.contentId} className="flex items-center gap-3 px-6 py-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg border flex-shrink-0",
                      contentTypeColor(item.contentType)
                    )}>
                      {contentTypeIcon(item.contentType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.contentTitle}</p>
                      <p className="text-xs text-slate-400 truncate">{item.courseName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Recent Enrollments + Course Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Enrollments */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-800">Đăng ký gần đây</CardTitle>
            <CardDescription>Học viên đăng ký khóa học của bạn mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {enrollmentsLoading ? (
              <div className="space-y-3 px-6 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : !enrollments || enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Chưa có đăng ký nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {enrollments.map((e) => (
                  <li key={e.enrollmentId} className="flex items-center gap-4 px-6 py-4">
                    <Avatar className="w-10 h-10 border border-slate-100 flex-shrink-0">
                      <AvatarFallback className="text-sm font-bold bg-slate-100 text-slate-600">
                        {getInitials(e.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{e.studentName}</p>
                      <p className="text-xs text-slate-400 truncate">{e.courseName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${e.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{e.progressPercent}%</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDate(e.enrollmentDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Course Stats Table */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3 flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Khóa học của bạn</CardTitle>
              <CardDescription>Thống kê chi tiết theo từng khóa học</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-slate-500 hover:text-slate-900 -mr-2">
              <Link href="/lms/courses">
                Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {courseStatsLoading ? (
              <div className="space-y-3 px-6 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : !courseStats || courseStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Chưa có khóa học nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {courseStats.map((c) => (
                  <li key={c.courseId} className="flex items-center gap-3 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.courseName}</p>
                        {c.needsAiSync && (
                          <Badge className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] px-1.5 py-0 h-4 rounded-full font-medium whitespace-nowrap">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Cần đồng bộ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {c.studentCount}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> {formatVND(c.revenue)}
                        </span>
                        {c.rating > 0 && (
                          <span className="text-xs text-amber-500 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" /> {c.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] h-5 px-2 rounded-full font-semibold flex-shrink-0",
                        c.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      {c.status === "Published" ? "Đã đăng" : "Bản nháp"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
