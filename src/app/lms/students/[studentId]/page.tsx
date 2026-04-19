"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, FileText, GraduationCap, LayoutDashboard, Mail, PlayCircle, Star, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { 
  useStudentDetail, 
  useStudentQuizzes, 
  useStudentComments 
} from "@/hooks/queries/use-instructor"
import Image from "next/image"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

function getInitials(name: string) {
  if (!name) return "U"
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params)

  const { data: detail, isLoading: isLoadingDetail } = useStudentDetail(studentId)
  const { data: quizzes, isLoading: isLoadingQuizzes } = useStudentQuizzes(studentId)
  const { data: comments, isLoading: isLoadingComments } = useStudentComments(studentId)

  if (isLoadingDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy thông tin</h2>
        <p className="text-slate-500 mb-6">Học viên này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button asChild variant="outline">
          <Link href="/lms/students">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 border-slate-200">
            <Link href="/lms/students">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
              <AvatarImage src={detail.studentAvatar || undefined} />
              <AvatarFallback className="text-lg font-bold bg-indigo-50 text-indigo-700">
                {getInitials(detail.studentName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{detail.studentName}</h1>
              <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5" />
                {detail.studentEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BookOpen className="w-16 h-16" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">Khóa học đã đăng ký</p>
            <p className="text-3xl font-bold text-slate-900">{detail.totalEnrolledCourses}</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <PlayCircle className="w-16 h-16" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">Tiến độ trung bình</p>
            <p className="text-3xl font-bold text-slate-900">
              {detail.averageProgress.toFixed(0)}<span className="text-xl text-slate-500 font-medium">%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Star className="w-16 h-16" />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">Tổng thanh toán</p>
            <p className="text-3xl font-bold text-emerald-600">{formatPrice(detail.totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger value="courses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Khóa học ({detail.enrolledCourses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Lịch sử Quiz ({quizzes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Bình luận ({comments?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab Courses */}
        <TabsContent value="courses" className="space-y-4 outline-none">
          {detail.enrolledCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detail.enrolledCourses.map(course => (
                <Card key={course.courseId} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 p-4">
                    <div className="relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                      {course.courseThumbnail ? (
                        <Image src={course.courseThumbnail} alt={course.courseName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 line-clamp-2 leading-tight mb-1">
                        {course.courseName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <Badge variant="outline" className="bg-slate-50 border-slate-200 font-normal text-xs">
                          {course.status === 'NOT_STARTED' ? 'Chưa học' : course.status === 'IN_PROGRESS' ? 'Đang học' : 'Đã hoàn thành'}
                        </Badge>
                        <span className="text-xs font-medium text-emerald-600">
                          {formatPrice(course.pricePaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <p className="text-xs text-slate-500 mb-1">Ngày tham gia</p>
                       <p className="font-medium text-slate-700">{formatDate(course.enrolledAt)}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 mb-1">Tiến độ</p>
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-2 rounded-full border border-slate-200 bg-slate-100 overflow-hidden">
                           <div 
                             className="h-full bg-indigo-500 rounded-full" 
                             style={{ width: `${course.progressPercent}%` }} 
                           />
                         </div>
                         <span className="font-medium text-slate-700 text-xs">{course.progressPercent}%</span>
                       </div>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 border-dashed bg-slate-50/50 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-slate-500">Học viên chưa đăng ký khóa học nào.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Quizzes */}
        <TabsContent value="quizzes" className="space-y-4 outline-none">
          {isLoadingQuizzes ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {quizzes.map((quiz, idx) => (
                  <div key={idx} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-semibold text-slate-900">{quiz.quizTitle}</h4>
                        <Badge variant={quiz.status === 'PASS' ? 'success' : 'destructive'} className="h-5 px-1.5 text-[10px]">
                          {quiz.status === 'PASS' ? 'ĐẠT' : 'CHƯA ĐẠT'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 ml-7">{quiz.courseName}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm ml-7 sm:ml-0">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Điểm số</p>
                        <p className="font-bold text-slate-900">{quiz.score}<span className="text-slate-400 font-medium">/100</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Số lần thi</p>
                        <p className="font-medium text-slate-900">{quiz.retakeCount}</p>
                      </div>
                      <div className="text-right hidden sm:block min-w-24">
                        <p className="text-xs text-slate-400 mb-0.5">Nộp bài</p>
                        <p className="font-medium text-slate-900 text-xs">{formatDate(quiz.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <Card className="border-slate-200 border-dashed bg-slate-50/50 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-slate-500">Chưa có lịch sử làm bài kiểm tra.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Comments */}
        <TabsContent value="comments" className="space-y-4 outline-none">
          {isLoadingComments ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.commentId} className="border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="mt-1 bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h4 className="font-semibold text-slate-900">{comment.contentTitle}</h4>
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                          {comment.commentContent}
                        </p>
                        <p className="text-xs font-medium text-indigo-600 mt-3 inline-flex items-center bg-indigo-50 px-2 py-1 rounded">
                          Khóa học: {comment.courseName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="border-slate-200 border-dashed bg-slate-50/50 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-slate-500">Chưa có bình luận nào.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
      </Tabs>
    </div>
  )
}
