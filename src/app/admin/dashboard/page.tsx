"use client"

import { useState } from "react"
import {
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  ClipboardList,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  useAdminDashboardOverview,
  useAdminRecentActivities,
  useAdminRevenueStats,
} from "@/hooks/queries/use-admin-dashboard"
import { RecentActivity, RevenuePeriod } from "@/lib/services/admin-dashboard.service"
import { cn } from "@/lib/utils"

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`
  return `${amount.toLocaleString("vi-VN")} ₫`
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    if (diffMins < 1) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút trước`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} ngày trước`
    return format(date, "dd/MM/yyyy", { locale: vi })
  } catch {
    return dateStr
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ─── Activity config ────────────────────────────────────────────────────────

interface ActivityConfig {
  icon: React.ElementType
  color: string
  bg: string
  label: string
}

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  ORDER: {
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Mua khóa học",
  },
  REFUND_REQUEST: {
    icon: RotateCcw,
    color: "text-rose-600",
    bg: "bg-rose-50",
    label: "Hoàn tiền",
  },
  INSTRUCTOR_APPLICATION: {
    icon: ClipboardList,
    color: "text-violet-600",
    bg: "bg-violet-50",
    label: "Đơn giảng viên",
  },
  ENROLLMENT: {
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Ghi danh",
  },
}

function getActivityConfig(type: string): ActivityConfig {
  return ACTIVITY_CONFIG[type] ?? {
    icon: AlertCircle,
    color: "text-slate-500",
    bg: "bg-slate-50",
    label: type,
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  iconBg: string
  description?: string
  loading?: boolean
  href?: string
  badge?: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  description,
  loading,
  href,
  badge,
}: StatCardProps) {
  const content = (
    <Card className="relative overflow-hidden rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-9 w-28 mt-1" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight text-foreground">
                {value}
              </p>
            )}
            {description && !loading && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-2xl flex-shrink-0", iconBg)}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        </div>
        {badge && (
          <Badge className="mt-3 bg-rose-50 text-rose-600 border-rose-100 text-[10px] px-1.5 h-4 rounded-full">
            {badge}
          </Badge>
        )}
        {href && (
          <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

// ─── Activity Item ──────────────────────────────────────────────────────────

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const config = getActivityConfig(activity.type)
  const Icon = config.icon

  return (
    <li className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors">
      <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 mt-0.5", config.bg)}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {activity.actorName}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {activity.description}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <Badge
          variant="secondary"
          className={cn("text-[10px] h-5 px-1.5 rounded-full font-medium mb-1 block", config.bg, config.color)}
        >
          {config.label}
        </Badge>
        <p className="text-[10px] text-muted-foreground">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>
    </li>
  )
}

// ─── Skeleton helpers ───────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-1 px-6 py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Chart Config ──────────────────────────────────────────────────────────

const revenueChartConfig = {
  totalRevenue: { label: "Doanh thu (₫)", color: "hsl(221, 83%, 53%)" },
} satisfies ChartConfig

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("daily")

  const { data: overview, isLoading: overviewLoading } = useAdminDashboardOverview()
  const { data: activities, isLoading: activitiesLoading } = useAdminRecentActivities(10)
  const { data: revenueStats, isLoading: revenueLoading } = useAdminRevenueStats(revenuePeriod)

  const chartData = revenueStats?.items.map((item) => ({
    label:
      revenuePeriod === "daily"
        ? item.label.slice(5) // "05-10" from "2026-05-10"
        : item.label.slice(2), // "25-06" from "2025-06"
    totalRevenue: item.totalRevenue,
  })) ?? []

  const statCards: StatCardProps[] = [
    {
      title: "Tổng học viên",
      value: overviewLoading ? "—" : (overview?.totalStudents ?? 0).toLocaleString(),
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      description: "Học viên đã đăng ký",
      loading: overviewLoading,
    },
    {
      title: "Giảng viên",
      value: overviewLoading ? "—" : (overview?.totalInstructors ?? 0).toLocaleString(),
      icon: GraduationCap,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      description: "Giảng viên hoạt động",
      loading: overviewLoading,
    },
    {
      title: "Tổng khóa học",
      value: overviewLoading ? "—" : (overview?.totalCourses ?? 0).toLocaleString(),
      icon: BookOpen,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      description: "Khóa học trên hệ thống",
      loading: overviewLoading,
    },
    {
      title: "Doanh thu",
      value: overviewLoading ? "—" : formatVND(overview?.totalRevenue ?? 0),
      icon: DollarSign,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      description: "Tổng doanh thu hệ thống",
      loading: overviewLoading,
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng quan hoạt động của nền tảng.
          </p>
        </div>

        {/* Pending Applications Badge */}
        {!overviewLoading && (overview?.pendingInstructorApplications ?? 0) > 0 && (
          <Link href="/admin/instructors">
            <Badge className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer text-xs rounded-full">
              <ClipboardList className="w-3.5 h-3.5" />
              {overview!.pendingInstructorApplications} đơn giảng viên đang chờ duyệt
              <ArrowRight className="w-3 h-3" />
            </Badge>
          </Link>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Revenue Chart + Activities ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Revenue Chart */}
        <Card className="lg:col-span-3 rounded-xl border bg-background shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Doanh thu
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {revenueStats
                    ? `${revenueStats.startDate} → ${revenueStats.endDate}`
                    : "Đang tải..."}
                </CardDescription>
              </div>
              <Tabs
                value={revenuePeriod}
                onValueChange={(val) => setRevenuePeriod(val as RevenuePeriod)}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-3 h-6">
                    7 ngày
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-3 h-6">
                    12 tháng
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="flex gap-2 items-end h-52">
                {[40, 70, 30, 90, 50, 80, 60].map((h, i) => (
                  <Skeleton key={i} className="flex-1 rounded-md" style={{ height: h * 1.8 }} />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertCircle className="w-8 h-8 text-slate-200" />
                <p className="text-sm">Chưa có dữ liệu doanh thu</p>
              </div>
            ) : (
              <>
                <ChartContainer config={revenueChartConfig} className="h-52 w-full">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(1)}M`
                          : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : `${v}`
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [formatVND(Number(value)), "Doanh thu"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="totalRevenue"
                      radius={[6, 6, 0, 0]}
                      fill="hsl(221, 83%, 53%)"
                    />
                  </BarChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Tổng:{" "}
                  <span className="font-semibold text-foreground">
                    {formatVND(chartData.reduce((sum, d) => sum + d.totalRevenue, 0))}
                  </span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 rounded-xl border bg-background shadow-sm flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Hoạt động gần đây</CardTitle>
              <Badge variant="secondary" className="rounded-full text-xs">
                {activities?.length ?? 0}
              </Badge>
            </div>
            <CardDescription>Các hoạt động mới nhất trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {activitiesLoading ? (
              <ActivitySkeleton />
            ) : !activities || activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có hoạt động nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                {activities.map((activity, idx) => (
                  <ActivityItem key={`${activity.actorId}-${activity.createdAt}-${idx}`} activity={activity} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Links ── */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Quản lý nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Học viên & Giảng viên", href: "/admin/users", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Giảng viên", href: "/admin/instructors", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Khóa học", href: "/admin/courses", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Categories", href: "/admin/categories", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="rounded-xl border bg-background shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", item.bg)}>
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {item.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
