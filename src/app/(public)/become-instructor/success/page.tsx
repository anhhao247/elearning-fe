import Link from "next/link"
import { CheckCircle2, ArrowRight, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Đăng ký thành công | E-Learning Platform",
  description: "Cảm ơn bạn đã nộp đơn đăng ký làm giảng viên.",
}

export default function SuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh] px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-all animate-pulse duration-2000"></div>
            <div className="relative p-5 bg-green-500 text-white rounded-full shadow-xl">
              <CheckCircle2 className="size-16" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Cảm ơn bạn!</h1>
            <p className="text-xl text-muted-foreground">
              Đơn đăng ký của bạn đã được gửi thành công.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4 text-left">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
               <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bước tiếp theo?</h3>
              <p className="text-muted-foreground">
                Đội ngũ của chúng tôi sẽ xem xét hồ sơ của bạn trong vòng <span className="font-bold text-foreground">2-3 ngày làm việc</span>. 
                Bạn sẽ nhận được thông báo qua email ngay khi có kết quả.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 gap-2 group">
              <Link href="/">
                <Home className="size-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 gap-2">
              <Link href="/courses">
                Khám phá khóa học
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground px-4">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi tại <span className="text-primary cursor-pointer hover:underline font-medium">support@elearning.com</span>
        </p>
      </div>
    </div>
  )
}
