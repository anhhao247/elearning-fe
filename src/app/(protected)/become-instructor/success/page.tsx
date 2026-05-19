import Link from "next/link"
import { CheckCircle2, ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Đăng ký thành công | E-Learning Platform",
  description: "Hồ sơ đăng ký giảng viên của bạn đã được gửi thành công và đang trong quá trình xét duyệt.",
}

export default function BecomeInstructorSuccessPage() {
  return (
    <div className="page-container flex items-center justify-center min-h-[80vh] py-12 px-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-emerald-500 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            Gửi hồ sơ đăng ký thành công!
          </CardTitle>
          <CardDescription className="text-base max-w-lg mx-auto text-muted-foreground">
            Cảm ơn bạn đã lựa chọn đồng hành và chia sẻ tri thức cùng cộng đồng học viên của chúng tôi.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 md:px-10">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4 text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              Quy trình kiểm duyệt hồ sơ (24h – 48h)
            </h3>
            <p className="leading-relaxed text-sm md:text-base">
              Hồ sơ giảng viên của bạn hiện đang được ban quản trị hệ thống kiểm duyệt kỹ lưỡng nhằm đảm bảo chất lượng giảng dạy tốt nhất. Quá trình này thường diễn ra trong vòng <strong>24 đến 48 giờ làm việc</strong>.
            </p>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Đặc quyền trải nghiệm sớm dành cho bạn:
            </h4>
            <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  <strong>Truy cập không giới hạn vào trang LMS:</strong> Khám phá ngay hệ thống quản lý khóa học chuyên nghiệp dành cho giảng viên.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  <strong>Khởi tạo khóa học nháp (Draft):</strong> Bạn hoàn toàn có thể bắt đầu xây dựng cấu trúc bài giảng, tải lên video và biên soạn tài liệu ngay từ bây giờ.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  <em>Lưu ý: Các khóa học sẽ được lưu dưới dạng Bản nháp và chỉ chính thức được xuất bản (Publish) công khai sau khi hồ sơ giảng viên được phê duyệt hoàn tất.</em>
                </span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 px-6 md:px-10 pb-8 pt-4">
          <Button asChild size="lg" className="w-full sm:w-1/2 h-12 text-base font-semibold group">
            <Link href="/lms/courses">
              <BookOpen className="mr-2 w-5 h-5" />
              Vào trang LMS ngay
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-1/2 h-12 text-base font-semibold">
            <Link href="/">
              Về trang chủ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
