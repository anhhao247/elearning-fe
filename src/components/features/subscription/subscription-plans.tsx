"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import {
  useCurrentSubscription,
  usePurchaseSubscription,
  useSubscriptionPlans,
} from "@/hooks/queries/use-subscription"
import { SubscriptionPlan } from "@/types/subscription"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PlanCardProps {
  plan: SubscriptionPlan
  isActivePlan: boolean
  isPurchasing: boolean
  onPurchase: (planId: number) => void
}

export function SubscriptionPlans() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: plans, isLoading, isError, refetch } = useSubscriptionPlans()
  const shouldFetchCurrent = user?.role === "STUDENT"
  const { data: currentSubscription } = useCurrentSubscription(shouldFetchCurrent)
  const purchaseMutation = usePurchaseSubscription()

  const activePlanId =
    currentSubscription?.isPro && currentSubscription?.status === "ACTIVE"
      ? currentSubscription.planId
      : undefined

  const visiblePlans = useMemo(
    () => (plans || []).filter((plan) => plan.isActive),
    [plans]
  )

  const handlePurchase = async (planId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký gói Pro.")
      router.push("/login?next=/plans")
      return
    }

    if (user.role !== "STUDENT") {
      toast.error("Chỉ học viên mới có thể đăng ký gói Pro.")
      return
    }

    if (activePlanId === planId) {
      toast.success("Bạn đang sử dụng gói này.")
      return
    }

    try {
      toast.loading("Đang chuyển hướng tới VNPay...", { id: "vnpay-redirect" })
      const response = await purchaseMutation.mutateAsync(planId)

      if (response?.url) {
        window.location.href = response.url
        return
      }

      toast.dismiss("vnpay-redirect")
      toast.error("Không nhận được đường dẫn thanh toán. Vui lòng thử lại.")
    } catch {
      toast.dismiss("vnpay-redirect")
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.08),_transparent_60%)]">
      <section className="border-b border-border/50 bg-gradient-to-b from-slate-50 via-white to-transparent">
        <div className="page-container section-spacing text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Nâng cấp trải nghiệm học tập
          </div>
          <div className="space-y-4">
            <h1 className="text-hero text-foreground tracking-tight">Gói Pro cho học viên</h1>
            <p className="text-body text-lg text-muted-foreground max-w-2xl">
              Mở khóa kho nội dung nâng cao, học không giới hạn và nhận hỗ trợ ưu tiên từ đội ngũ Learnly.
            </p>
          </div>

          {currentSubscription?.isPro && currentSubscription.status === "ACTIVE" ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left">
              <p className="text-sm font-semibold text-emerald-700">Bạn đang sử dụng gói Pro</p>
              <div className="text-sm text-emerald-700/80">
                <span className="font-medium">Thời hạn:</span> {formatDate(currentSubscription.startedAt)} - {formatDate(currentSubscription.expiredAt)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
              <p className="text-sm font-semibold text-slate-700">Bạn chưa có gói Pro đang hoạt động</p>
              <p className="text-sm text-slate-500">Chọn gói phù hợp để bắt đầu ngay hôm nay.</p>
            </div>
          )}
        </div>
      </section>

      <section className="page-container section-spacing">
        {isLoading && <PlansSkeleton />}

        {isError && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Không thể tải danh sách gói</CardTitle>
              <CardDescription>Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => refetch()}>Thử lại</Button>
            </CardFooter>
          </Card>
        )}

        {!isLoading && !isError && visiblePlans.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Chưa có gói nào</CardTitle>
              <CardDescription>Hiện chưa có gói Pro hoạt động. Vui lòng quay lại sau.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !isError && visiblePlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visiblePlans.map((plan) => {
              const isActivePlan = activePlanId === plan.id
              const isPurchasing = purchaseMutation.isPending && purchaseMutation.variables === plan.id

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isActivePlan={isActivePlan}
                  isPurchasing={isPurchasing}
                  onPurchase={handlePurchase}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function PlanCard({ plan, isActivePlan, isPurchasing, onPurchase }: PlanCardProps) {
  const isHighlighted = plan.name.toLowerCase().includes("pro")

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
        isHighlighted && "border-primary/40 shadow-primary/10"
      )}
    >
      {isHighlighted && (
        <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Best value
        </div>
      )}
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg font-semibold text-foreground">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground">{formatVnd(plan.price)}</span>
          <span className="text-sm text-muted-foreground">/ {plan.durationDays} ngày</span>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Học không giới hạn
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Tài liệu độc quyền cho Pro
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Hỗ trợ ưu tiên từ trợ giảng
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/60">
        <Button
          className="w-full"
          disabled={isActivePlan || isPurchasing}
          onClick={() => onPurchase(plan.id)}
        >
          {isActivePlan ? "Đang kích hoạt" : isPurchasing ? "Đang chuyển hướng..." : "Đăng ký gói"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border/70">
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/60">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
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
