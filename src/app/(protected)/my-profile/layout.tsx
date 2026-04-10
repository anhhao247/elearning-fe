"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, BookOpen, FileText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function MyProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push("/login");
    }
  }, [_hasHydrated, user, router]);

  const userInitials =
    user && user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.username.slice(0, 2).toUpperCase() || "U";

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const navItems = [
    { href: "/my-profile", label: "Tài khoản", icon: User },
    { href: "/my-profile/courses", label: "Khóa học của tôi", icon: BookOpen },
    { href: "/my-profile/posts", label: "Bài viết", icon: FileText },
    { href: "/my-profile/settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
      {!_hasHydrated || !user ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
            {/* User Info Card */}
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-sm">
                  <AvatarImage src={user?.avatar || ""} alt={user?.username || ""} />
                  <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <h2 className="text-xl font-bold">{user?.username || ""}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col rounded-xl overflow-hidden bg-card border shadow-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors hover:bg-muted/50",
                      isActive
                        ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="mx-6 py-2 border-t border-border/50"></div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </nav>
          </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
        )}
    </div>
  );
}
