import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Video, Award, Code, Briefcase, Layout, MonitorPlay, Star, ArrowRight } from "lucide-react";
import { getCourses } from "@/lib/services/course.service";
import { CourseCard } from "@/components/features/courses/course-card";
import { Course } from "@/types/course";

export default async function Home() {
  // Fetch newest/popular courses
  // Handle gracefully if API is down
  let popularCourses: Course[] = [];
  try {
    const res = await getCourses({ limit: '4', sortBy: 'createdAt', sortDir: 'desc' });
    if (res && res.content) {
      popularCourses = res.content;
    }
  } catch (error) {
    console.error("Failed to fetch popular courses:", error);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0" />
        <div className="container relative z-10 mx-auto px-4 md:px-6 pt-20 pb-24 lg:pt-32 lg:pb-36 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-semibold border-primary/20 bg-primary/5 text-primary">
              🌟 Nền tảng học tập hàng đầu 2026
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
              Mở khóa tiềm năng của bạn cùng <span className="text-primary">Learnly</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Học hỏi từ các chuyên gia hàng đầu. Nâng cao kỹ năng, đạt được chứng chỉ và thăng tiến trong sự nghiệp với các khóa học thực tế chất lượng cao.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="h-14 px-8 text-base shadow-lg shadow-primary/20">
                <Link href="/courses">
                  Khám phá khóa học <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base border-2 hover:bg-accent">
                <Link href="/register">Đăng ký miễn phí</Link>
              </Button>
            </div>
            {/* Trust Badges */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-background z-30" />
                  <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-background z-20" />
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-background z-10" />
                </div>
                <span>Hơn 10,000 học viên</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                <span className="text-foreground ml-1">4.9/5</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <Image
                src="/hero-bg.png"
                alt="Sinh viên đang học tập trực tuyến"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -left-6 md:bottom-10 md:-left-10 bg-background rounded-xl p-4 shadow-xl border border-border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
              <div className="bg-primary/10 p-3 rounded-lg text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-xl leading-none">500+</p>
                <p className="text-sm text-muted-foreground mt-1">Video bài giảng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary Section */}
      <section className="border-y border-border/50 bg-card py-10">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl md:text-4xl font-black text-foreground">500+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Khóa học</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl md:text-4xl font-black text-foreground">10K+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Học viên</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl md:text-4xl font-black text-foreground">100+</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Giảng viên</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl md:text-4xl font-black text-foreground">98%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Hài lòng</span>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Danh mục nổi bật</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Khám phá các chủ đề học tập đang được quan tâm nhất hiện nay.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex group">
            <Link href="/courses">
              Xem tất cả danh mục <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Code, title: "Lập trình & IT", count: "150+ khóa học", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Briefcase, title: "Kinh doanh", count: "120+ khóa học", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Layout, title: "Thiết kế UI/UX", count: "85+ khóa học", color: "text-pink-500", bg: "bg-pink-500/10" },
            { icon: MonitorPlay, title: "Marketing", count: "90+ khóa học", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((cat, i) => (
            <Link key={i} href="/courses">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 group cursor-pointer bg-card h-full border-border/50">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-full ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="bg-muted/30 border-y border-border/50 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Khóa học được yêu thích</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Cập nhật những kiến thức mới nhất từ các chuyên gia hàng đầu qua các khóa học có lượt đánh giá cao nhất.
              </p>
            </div>
            <Button variant="outline" asChild className="group">
              <Link href="/courses">
                Xem tất cả khóa học <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-background border rounded-xl">
              <p className="text-muted-foreground">Hiện chưa có khóa học nào được hiển thị, vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US - Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Tại sao chọn Learnly?</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Học tập hiệu quả với phương pháp hiện đại</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cung cấp trải nghiệm học tập tốt nhất, giúp bạn tiếp thu kiến thức nhanh chóng và dễ dàng.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MonitorPlay,
                title: "Học mọi lúc mọi nơi",
                description: "Học tập không giới hạn trên đa nền tảng. Đồng bộ tiến độ học tập trên máy tính và điện thoại. Tiếp tục học bất cứ lúc nào."
              },
              {
                icon: BookOpen,
                title: "Thực hành thực tế",
                description: "Không chỉ học lý thuyết, bạn sẽ được làm các mini project, bài tập thực hành sát với yêu cầu thực tế của doanh nghiệp."
              },
              {
                icon: Award,
                title: "Chứng chỉ hoàn thành",
                description: "Nhận chứng chỉ uy tín sau khi hoàn thành khóa học. Tích hợp trực tiếp vào LinkedIn giúp hồ sơ của bạn nổi bật hơn."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="w-32 h-32 text-primary" />
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary relative z-10">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="container mx-auto pb-24 pt-10 px-4 md:px-6">
        <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Sẵn sàng để bắt đầu hành trình học tập?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed font-medium">
              Tham gia cùng hàng ngàn học viên khác đã và đang nâng cao kỹ năng của mình mỗi ngày. Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild className="h-14 px-10 text-lg font-bold shadow-xl hover:scale-105 transition-transform duration-300">
                <Link href="/register">Tham gia ngay miễn phí</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
