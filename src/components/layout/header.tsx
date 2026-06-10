"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchSuggestions } from "@/hooks/queries/use-course";
import { generateSlug } from "@/lib/utils";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const { data: suggestions, isLoading } = useSearchSuggestions(debouncedSearchText);

  const showSuggestions = searchText.trim().length > 0;
  const keywordItems = suggestions?.keywords ?? [];
  const courseItems = suggestions?.courses ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    setSearchText("");
    router.push(`/courses?keyword=${encodeURIComponent(query)}`);
  };

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
                href="/my-profile/courses"
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

        <form
          onSubmit={handleSubmit}
          className="relative hidden lg:block w-full max-w-md"
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm khóa học..."
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="space-y-3 p-4">
                {isLoading ? (
                  <p className="text-sm text-slate-500">Đang tìm...</p>
                ) : (
                  <>
                    {keywordItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Từ khóa gợi ý
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {keywordItems.map((keyword) => (
                            <Link
                              key={keyword}
                              href={`/courses?keyword=${encodeURIComponent(keyword)}`}
                              onClick={() => setSearchText("")}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:border-primary hover:text-primary"
                            >
                              {keyword}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {courseItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Khóa học
                        </div>
                        <div className="space-y-2">
                          {courseItems.map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${generateSlug(course.title, course.id)}`}
                              onClick={() => setSearchText("")}
                              className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                            >
                              <div className="h-12 w-16 overflow-hidden rounded-xl bg-slate-100">
                                {course.thumbnail ? (
                                  <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                  {course.title}
                                </p>
                                <p className="text-xs text-slate-500">{course.instructorName}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {keywordItems.length === 0 && courseItems.length === 0 && (
                      <p className="text-sm text-slate-500">Không tìm thấy kết quả phù hợp.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Link href="/plans">Gói Pro</Link>
          </Button>
          {user && <NotificationBell />}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
