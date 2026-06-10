"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Calendar, Crown } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useCurrentSubscription } from "@/hooks/queries/use-subscription"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionProfilePage() {
  const { user } = useAuthStore()
  const canFetch = user?.role === "STUDENT"
  const { data, isLoading } = useCurrentSubscription(canFetch)

  const isActive = data?.status === "ACTIVE"
  const statusLabel = isActive ? "Đang hoạt động" : data?.status === "NONE" ? "Chưa có đăng ký" : "Chưa kích hoạt"

  const formattedPrice = useMemo(() => {
    if (!data?.planPrice) return "--"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.planPrice)
  }, [data?.planPrice])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gói đăng ký hiện tại</h1>
        <p className="text-muted-foreground mt-2">Theo dõi trạng thái gói đăng ký của bạn.</p>
      </div>

      {!canFetch && (
        <Card>
          <CardHeader>
            <CardTitle>Không khả dụng</CardTitle>
            <CardDescription>Tính năng này chỉ dành cho học viên.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {canFetch && isLoading && <SubscriptionSkeleton />}

      {canFetch && !isLoading && (
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{data?.planName || "Gói đăng ký"}</CardTitle>
              <CardDescription className="mt-1">{statusLabel}</CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3.5 w-3.5" />
              PRO
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Giá gói</p>
                <p className="text-lg font-semibold text-foreground mt-2">{formattedPrice}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Thời hạn</p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {data?.planDurationDays ? `${data.planDurationDays} ngày` : "--"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Bắt đầu
                </div>
                <p className="text-base font-semibold text-foreground mt-2">{formatDate(data?.startedAt)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Hết hạn
                </div>
                <p className="text-base font-semibold text-foreground mt-2">{formatDate(data?.expiredAt)}</p>
              </div>
            </div>

            {!isActive && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="rounded-xl">
                  <Link href="/plans">Đăng ký gói Pro</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/plans">Xem các gói khác</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SubscriptionSkeleton() {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24 mt-2" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  )
}

function formatDate(value?: string) {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
