import { InstructorApplyForm } from "./_components/instructor-apply-form"
import { Sparkles, Users, Award, BookOpen } from "lucide-react"

export const metadata = {
  title: "Trở thành Giảng viên | E-Learning Platform",
  description: "Chia sẻ kiến thức của bạn và giúp đỡ hàng nghìn học viên trên khắp thế giới trở thành chuyên gia.",
}

export default function BecomeInstructorPage() {
  return (
    <div className="container py-12 px-4 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-2">
          <Sparkles className="size-4" />
          <span>Mở rộng sự nghiệp giảng dạy của bạn</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl text-foreground">
          Trở thành một <span className="text-primary italic">Giảng viên</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground mx-auto leading-relaxed">
          Tham gia vào cộng đồng giảng viên của chúng tôi. Chia sẻ kinh nghiệm, xây dựng thương hiệu cá nhân và tạo ra thu nhập từ những gì bạn đam mê.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Users,
            title: "Tiếp cận hàng triệu học viên",
            description: "Khóa học của bạn sẽ được hiển thị cho hàng nghìn người đang tìm kiếm kiến thức mỗi ngày.",
          },
          {
            icon: Award,
            title: "Xây dựng thương hiệu",
            description: "Khẳng định vị thế chuyên gia của bạn trong ngành thông qua các bài giảng chất lượng.",
          },
          {
            icon: BookOpen,
            title: "Công cụ giảng dạy hiện đại",
            description: "Chúng tôi cung cấp hệ thống LMS chuyên nghiệp giúp bạn quản lý bài giảng và học viên dễ dàng.",
          },
        ].map((benefit, index) => (
          <div key={index} className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group">
            <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <benefit.icon className="size-6" />
            </div>
            <h3 className="text-xl font-bold">{benefit.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </section>

      {/* Form Section */}
      <section id="apply-form" className="py-8">
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Gửi hồ sơ đăng ký của bạn</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        <InstructorApplyForm />
      </section>

      {/* Footer Info */}
      <section className="text-center pt-8 border-t">
        <p className="text-sm text-muted-foreground">
            Bằng cách gửi đơn đăng ký, bạn đồng ý với <a href="#" className="underline font-medium hover:text-primary">Điều khoản dành cho giảng viên</a> của chúng tôi.
            Hồ sơ của bạn sẽ được xét duyệt trong vòng 2-3 ngày làm việc.
        </p>
      </section>
    </div>
  )
}
