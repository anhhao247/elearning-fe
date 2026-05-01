"use client"

import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Learnly</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link
              href="/courses"
              className="transition-colors hover:text-foreground text-foreground/60"
            >
              Khóa học
            </Link>
            {user && (
              <Link
                href="/my-profile"
                className="transition-colors hover:text-foreground text-foreground/60"
              >
                Khóa học của tôi
              </Link>
            )}
            <Link
              href="/about"
              className="transition-colors hover:text-foreground text-foreground/60"
            >
              Về chúng tôi
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
