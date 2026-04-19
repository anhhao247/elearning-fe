"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getMyCourses } from "@/lib/services/course.service";
import { MyCourseCard } from "./_components/course-card";
import { Loader2, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuthStore();

  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const [tab, setTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("enrolledAt");
  const [sortDir, setSortDir] = useState("desc");

  const {
    data: myCoursesRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myCourses", page, limit, sortField, sortDir],
    queryFn: () => getMyCourses({ page, limit, sortBy: sortField, sortDir }),
    enabled: !!accessToken,
  });

  const filteredCourses = useMemo(() => {
    if (!myCoursesRes?.content) return [];
    let result = myCoursesRes.content;

    if (tab === "ONGOING") {
      result = result.filter((c) => c.progress > 0 && c.progress < 100);
    } else if (tab === "COMPLETED") {
      result = result.filter((c) => c.progress === 100);
    }

    if (searchTerm) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result;
  }, [myCoursesRes, tab, searchTerm]);

  const handleSortChange = (value: string) => {
    switch (value) {
      case "newest":
        setSortField("enrolledAt");
        setSortDir("desc");
        break;
      case "oldest":
        setSortField("enrolledAt");
        setSortDir("asc");
        break;
      case "title_asc":
        setSortField("course.title");
        setSortDir("asc");
        break;
      case "title_desc":
        setSortField("course.title");
        setSortDir("desc");
        break;
      default:
        break;
    }
    handlePageChange(0);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/my-profile/courses?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khóa học của tôi</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và tiếp tục quá trình học tập của bạn
        </p>
      </div>

      {/* Filters and Tabs */}
      <Tabs
        defaultValue="ALL"
        value={tab}
        onValueChange={setTab}
        className="w-full"
      >
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 border-b border-border/50 pb-4">
          <TabsList className="bg-transparent space-x-2">
            <TabsTrigger
              value="ALL"
              className="px-6 py-3 data-[state=active]:bg-primary/5 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none shadow-none transition-all border-x-0 border-t-0"
            >
              Tất cả khóa học
            </TabsTrigger>
            <TabsTrigger
              value="ONGOING"
              className="px-6 py-3 data-[state=active]:bg-primary/5 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none shadow-none transition-all border-x-0 border-t-0"
            >
              Đang học
            </TabsTrigger>
            <TabsTrigger
              value="COMPLETED"
              className="px-6 py-3 data-[state=active]:bg-primary/5 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none shadow-none transition-all border-x-0 border-t-0"
            >
              Đã hoàn thành
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm khóa học..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select onValueChange={handleSortChange} defaultValue="newest">
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="title_asc">Tên (A-Z)</SelectItem>
                <SelectItem value="title_desc">Tên (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Đang tải khóa học của bạn...
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed rounded-lg py-20">
          <p className="text-xl font-bold text-destructive">
            Lỗi khi tải dữ liệu
          </p>
          <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center border border-dashed rounded-lg bg-card/50 py-20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground max-w-sm">
            Bạn chưa đăng ký khóa học nào hoặc không có khóa học nào phù hợp với tìm kiếm.
          </p>
          <Button
            onClick={() => router.push("/courses")}
            variant="outline"
            className="mt-4"
          >
            Khám phá khóa học mới
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <MyCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination Section */}
      {myCoursesRes?.totalPages && myCoursesRes.totalPages > 1 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={myCoursesRes.first}
              onClick={() => handlePageChange(Math.max(0, page - 1))}
            >
              Trước
            </Button>
            <div className="text-sm font-medium px-4">
              Trang {myCoursesRes.number + 1} / {myCoursesRes.totalPages}
            </div>
            <Button
              variant="outline"
              disabled={myCoursesRes.last}
              onClick={() =>
                handlePageChange(
                  Math.min(myCoursesRes.totalPages - 1, page + 1),
                )
              }
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}