import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block text-xl text-primary">EduPlatform</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/courses" className="transition-colors hover:text-foreground/80 text-foreground/60">Khóa học</Link>
            <Link href="/instructors" className="transition-colors hover:text-foreground/80 text-foreground/60">Giảng viên</Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">Về chúng tôi</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
