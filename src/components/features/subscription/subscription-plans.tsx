"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles, ShieldCheck, Flame, Zap, ArrowRight, Award, Compass, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { gsap } from "gsap"
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

  const isUserPro = !!activePlanId

  const visiblePlans = useMemo(
    () => (plans || []).filter((plan) => plan.isActive),
    [plans]
  )

  useEffect(() => {
    if (!isLoading) {
      // Entry Animations
      gsap.fromTo(
        ".plan-header-animate",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15 }
      )
      gsap.fromTo(
        ".plan-card-animate",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1, delay: 0.2 }
      )
      gsap.fromTo(
        ".plan-faq-animate",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1, delay: 0.4 }
      )
    }
  }, [isLoading])

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-background text-foreground relative overflow-hidden pb-24">
      {/* Decorative Blur Spheres (Light theme version) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }} />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="plan-header-animate inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold text-primary/80 bg-primary/5 border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            NÂNG CẤP BẢN THÂN NGAY HÔM NAY
          </div>
          
          <h1 className="plan-header-animate text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Chọn Gói Học Tập <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">Phù Hợp Nhất</span>
          </h1>
          
          <p className="plan-header-animate text-slate-600 dark:text-zinc-300 text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Mở khóa kho nội dung nâng cao, tham gia các buổi thực hành thực chiến và nhận chứng nhận hoàn thành có giá trị quốc tế.
          </p>

          {/* User Status Bar */}
          <div className="plan-header-animate max-w-md mx-auto pt-4">
            {user ? (
              isUserPro ? (
                <div className="rounded-2xl border px-5 py-4 text-center bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-500/20">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Bạn đang sử dụng gói Pro
                  </p>
                  {currentSubscription && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Thời hạn: {formatDate(currentSubscription.startedAt)} - {formatDate(currentSubscription.expiredAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border px-5 py-4 text-center bg-white border-slate-200/80 dark:bg-zinc-900 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-indigo-300">Gói hiện tại: Gói Học Viên Thường (Free)</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Nâng cấp Pro để mở khóa toàn bộ đặc quyền.</p>
                </div>
              )
            ) : (
              <div className="rounded-2xl border px-5 py-4 text-center bg-white border-slate-200/80 dark:bg-zinc-900 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Bạn chưa đăng nhập</p>
                <p className="text-xs text-slate-500 mt-0.5">Hãy chọn một gói và đăng ký để bắt đầu học.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {isLoading && <PlansSkeleton />}

        {isError && (
          <Card className="border-destructive/20 bg-destructive/5 text-center p-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Không thể tải danh sách gói</CardTitle>
              <CardDescription className="text-slate-500">Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.</CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => refetch()}>Thử lại</Button>
            </CardFooter>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
            
            {/* ── CARD 1: GÓI FREE (STATIC) ── */}
            <div className="plan-card-animate flex flex-col">
              <Card 
                className="h-full border border-slate-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
              >
                <CardHeader className="space-y-3 relative pb-6 border-b border-slate-100 dark:border-zinc-800">
                  <div className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-slate-400" /> Gói cơ bản
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Học Viên Thường (Free)</CardTitle>
                  <CardDescription className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed min-h-[40px]">
                    Trải nghiệm nền tảng, học các khóa học miễn phí và tương tác cùng cộng đồng.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-6 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-950 dark:text-white">0đ</span>
                    <span className="text-sm text-slate-500 dark:text-zinc-400">/ trọn đời</span>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-700 dark:text-zinc-300">
                    <p className="font-semibold text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wide">Tính năng bao gồm:</p>
                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Học toàn bộ bài giảng Miễn phí</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Lưu lại tiến trình học tập cá nhân</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Tham gia thảo luận & bình luận hỏi đáp</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Hỗ trợ giải đáp cơ bản từ AI Bot</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-sm font-semibold rounded-xl border-slate-200 text-slate-400 dark:border-zinc-700 bg-transparent"
                      disabled
                    >
                      {!isUserPro ? "Gói hiện tại của bạn" : "Đã kích hoạt"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-sm font-semibold rounded-xl text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
                      onClick={() => router.push("/register")}
                    >
                      Đăng ký ngay <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* ── CARDS 2+: GÓI PRO (DYNAMIC) ── */}
            {visiblePlans.map((plan) => {
              const isActivePlan = activePlanId === plan.id
              const isPurchasing = purchaseMutation.isPending && purchaseMutation.variables === plan.id
              const isBestSeller = plan.name.toLowerCase().includes("pro")

              return (
                <div key={plan.id} className="plan-card-animate flex flex-col relative">
                  {/* Glowing card border gradient for popular plan */}
                  {isBestSeller && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-[1.5px] -m-[1.5px] opacity-60" />
                  )}

                  <Card 
                    className={cn(
                      "h-full border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 relative z-10",
                      isBestSeller 
                        ? "shadow-[0_20px_40px_rgba(99,102,241,0.08)] bg-white border-transparent"
                        : "border-slate-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80"
                    )}
                  >
                    {isBestSeller && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-md flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" /> Phổ biến nhất
                      </div>
                    )}

                    <CardHeader className="space-y-3 relative pb-6 border-b border-slate-100 dark:border-zinc-800">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-indigo-500 fill-current" /> Gói nâng cao
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-slate-950 dark:text-white">{formatVnd(plan.price)}</span>
                        <span className="text-sm text-slate-500 dark:text-zinc-400">/ {plan.durationDays} ngày</span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-slate-700 dark:text-zinc-300">
                        <p className="font-semibold text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wide">Mọi quyền lợi của Free và:</p>
                        <div className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-950 dark:text-white">Mở khóa toàn bộ khóa học Premium</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>Tải tài liệu và mã nguồn độc quyền</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>Hỗ trợ ưu tiên 1-1 từ giảng viên & trợ giảng</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>Tham gia luyện thi thử & làm bài tập nâng cao</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>Cấp chứng nhận hoàn thành Learnly Certified</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                      <Button
                        className={cn(
                          "w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300",
                          isActivePlan 
                            ? "bg-emerald-600 hover:bg-emerald-600/90 text-white cursor-default" 
                            : isBestSeller
                              ? "bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] shadow-lg shadow-indigo-600/10 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        )}
                        disabled={isActivePlan || isPurchasing}
                        onClick={() => handlePurchase(plan.id)}
                      >
                        {isActivePlan ? (
                          <span className="flex items-center gap-1.5 justify-center">
                            <ShieldCheck className="w-4.5 h-4.5" /> Gói đang kích hoạt
                          </span>
                        ) : isPurchasing ? (
                          "Đang kết nối..."
                        ) : (
                          "Nâng cấp ngay"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Comparison & FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 mt-20 space-y-12">
        <div className="plan-faq-animate text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-indigo-500 mx-auto" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Câu hỏi thường gặp</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Giải đáp nhanh các thắc mắc về gói thành viên Pro của Learnly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {[
            {
              q: "Làm thế nào để thanh toán gói Pro?",
              a: "Bạn có thể dễ dàng thanh toán thông qua ví điện tử VNPay hoặc các thẻ ngân hàng nội địa/quốc tế bảo mật 256-bit SSL."
            },
            {
              q: "Tôi có được cấp chứng chỉ sau khóa học?",
              a: "Có, khi đăng ký gói Pro và hoàn thành đầy đủ bài học cũng như kiểm tra thử của khóa học Premium, bạn sẽ nhận được chứng chỉ Learnly."
            },
            {
              q: "Hỗ trợ 1-1 từ giảng viên hoạt động ra sao?",
              a: "Học viên gói Pro có một kênh thảo luận ưu tiên. Mọi thắc mắc của bạn về bài tập, mã nguồn sẽ được trợ giảng giải đáp trong vòng 2-4 giờ làm việc."
            },
            {
              q: "Gói Pro có gia hạn tự động không?",
              a: "Không. Chúng tôi không tự động trừ tiền của bạn. Khi gói Pro hết hạn, bạn sẽ trở về gói Free và có thể đăng ký lại bất kỳ lúc nào nếu muốn."
            }
          ].map((faq, i) => (
            <div key={i} className="plan-faq-animate p-6 rounded-2xl border border-slate-200 bg-white dark:bg-zinc-900/40 dark:border-zinc-800 space-y-2 shadow-sm">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">{faq.q}</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-light">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-slate-200/80 bg-white">
          <CardHeader className="space-y-3 pb-6 border-b border-slate-100">
            <Skeleton className="h-4 w-24 bg-slate-100" />
            <Skeleton className="h-7 w-48 bg-slate-100" />
            <Skeleton className="h-4 w-full bg-slate-100" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-10 w-32 bg-slate-100" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-slate-100" />
              <Skeleton className="h-4 w-5/6 bg-slate-100" />
              <Skeleton className="h-4 w-4/5 bg-slate-100" />
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t border-slate-100">
            <Skeleton className="h-11 w-full bg-slate-100" />
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
