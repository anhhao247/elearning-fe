import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  Award, 
  Globe, 
  Target, 
  Zap, 
  CheckCircle2, 
  Mail, 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Về chúng tôi | EduPlatform",
  description: "Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ đằng sau EduPlatform.",
};

const stats = [
  { label: "Học viên", value: "50,000+", icon: Users, color: "text-blue-500" },
  { label: "Khóa học", value: "1,200+", icon: BookOpen, color: "text-green-500" },
  { label: "Chuyên gia", value: "150+", icon: Award, color: "text-purple-500" },
  { label: "Quốc gia", value: "20+", icon: Globe, color: "text-orange-500" },
];

const team = [
  {
    name: "Nguyễn Văn A",
    role: "Founder & CEO",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=A",
    bio: "Chuyên gia với 10 năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến và phát triển phần mềm.",
  },
  {
    name: "Trần Thị B",
    role: "Head of Content",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
    bio: "Cựu giảng viên đại học, đam mê xây dựng những chương trình đào tạo chất lượng cao.",
  },
  {
    name: "Lê Văn C",
    role: "CTO",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=C",
    bio: "Kỹ sư hệ thống với tầm nhìn xây dựng một nền tảng học tập mượt mà và thông minh.",
  },
  {
    name: "Phạm Thị D",
    role: "Product Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=D",
    bio: "Luôn đặt trải nghiệm người dùng lên hàng đầu để tạo ra môi trường học tập trực quan nhất.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--primary-foreground)_0%,transparent_100%)] opacity-20" />
        <div className="container mx-auto max-w-5xl text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-3 duration-500">
            Về EduPlatform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
            Định nghĩa lại tương lai của <span className="text-primary bg-clip-text">giáo dục trực tuyến</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Chúng tôi xây dựng một nền tảng nơi kiến thức không có giới hạn, giúp hàng triệu người tiếp cận giáo dục chất lượng cao mọi lúc, mọi nơi.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Button size="lg" asChild>
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
            <Button size="lg" variant="outline">
              Liên hệ chúng tôi
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Sứ mệnh của chúng tôi</h2>
            <p className="text-lg text-muted-foreground">
              EduPlatform ra đời với mục tiêu xóa bỏ rào cản về chi phí và địa lý trong giáo dục. Chúng tôi tin rằng bất kỳ ai cũng xứng đáng được học tập từ những chuyên gia hàng đầu thế giới.
            </p>
            <ul className="space-y-4">
              {[
                "Tiếp cận giáo dục chất lượng cao dễ dàng",
                "Cá nhân hóa trải nghiệm học tập bằng AI",
                "Xây dựng cộng đồng học tập toàn cầu",
                "Kết nối học viên với các cơ hội nghề nghiệp"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-8">
              <Card className="bg-primary/5 border-primary/10 transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Tầm nhìn</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Trở thành nền tảng học tập phổ biến nhất khu vực.
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                  <CardTitle className="text-lg">Đổi mới</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Liên tục cập nhật công nghệ và phương pháp giảng dạy mới nhất.
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Cộng đồng</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Hỗ trợ lẫn nhau và cùng nhau phát triển bền vững.
                </CardContent>
              </Card>
              <Card className="bg-muted/50 transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <Award className="h-8 w-8 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Chất lượng</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Nội dung được kiểm duyệt bởi các chuyên gia đầu ngành.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <stat.icon className="h-8 w-8 mx-auto opacity-80" />
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 md:px-6 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Đội ngũ của chúng tôi</h2>
          <p className="text-muted-foreground">
            Hợp tác cùng những con người tài năng và tâm huyết để mang lại giá trị tốt nhất cho học viên.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <Card key={i} className="group overflow-hidden border-none shadow-none bg-transparent">
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                <Avatar className="h-32 w-32 mx-auto border-4 border-background shadow-xl">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="mb-1">{member.name}</CardTitle>
              <CardDescription className="text-primary font-medium mb-3">{member.role}</CardDescription>
              <p className="text-sm text-muted-foreground px-4 line-clamp-3 mb-4">
                {member.bio}
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  Twitter
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  Linkedin
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  Github
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 mb-8">
        <Card className="bg-muted border-none p-8 md:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Sẵn sàng bắt đầu hành trình học tập?</h2>
            <p className="text-muted-foreground">
              Tham gia cùng 50.000+ học viên khác và nâng cao kỹ năng của bạn ngay hôm nay với các khóa học chất lượng từ EduPlatform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20">
                Bắt đầu ngay bây giờ
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Xem thêm lộ trình
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
