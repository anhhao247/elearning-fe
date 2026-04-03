import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-zinc-50 dark:bg-zinc-950">
        <Badge variant="outline" className="mb-6 font-normal">
          🏆 Khám phá ngay hàng ngàn khóa học mới!
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Nền tảng học trực tuyến <br className="hidden md:block" /> tốt nhất dành cho bạn
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Truy cập hàng ngàn khóa học chất lượng cao, phát triển kỹ năng và thăng tiến trong sự nghiệp của bạn ngay hôm nay cùng chuyên gia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild className="h-12 px-8">
            <Link href="/courses">Khám phá khóa học</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-8">
            <Link href="/about">Tìm hiểu thêm</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16 md:py-24 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tại sao chọn chúng tôi?</h2>
          <p className="mt-4 text-lg text-muted-foreground">Các tính năng vượt trội giúp bạn có trải nghiệm học tập tuyệt vời.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              title: "Học mọi lúc mọi nơi",
              description: "Học tập không giới hạn trên đa nền tảng. Bạn có thể tiếp tục xem bài giảng bất cứ lúc nào."
            },
            {
              title: "1000+ Khóa học chất lượng",
              description: "Tất cả nội dung khóa học đều được biên soạn và kiểm định bởi các chuyên gia trong ngành."
            },
            {
              title: "Chứng chỉ hoàn thành",
              description: "Nhận chứng chỉ uy tín sau mỗi khóa học, giúp hồ sơ xin việc của bạn nổi bật hơn."
            }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-primary rounded-full" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
