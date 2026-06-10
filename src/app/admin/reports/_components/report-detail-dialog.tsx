"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Report, ReportTargetContent } from "@/lib/services/report.service"
import {
  useBanReportInstructor,
  useHideReportCourse,
  useResolveAdminReport,
} from "@/hooks/queries/use-admin-report-actions"

interface ReportDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
  isReportLoading: boolean
  contentDetail: ReportTargetContent | null
  isContentLoading: boolean
}

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "Đã giải quyết", className: "bg-emerald-100 text-emerald-700" },
  DISMISSED: { label: "Đã từ chối", className: "bg-slate-100 text-slate-600" },
}

const buildR2Url = (objectKey?: string | null) => {
  if (!objectKey) return null
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_BASE_URL
  if (!baseUrl) return null
  return `${baseUrl.replace(/\/$/, "")}/${objectKey.replace(/^\//, "")}`
}

export function ReportDetailDialog({
  open,
  onOpenChange,
  report,
  isReportLoading,
  contentDetail,
  isContentLoading,
}: ReportDetailDialogProps) {
  const [resolutionNote, setResolutionNote] = useState("")
  const [noteError, setNoteError] = useState("")
  const statusBadge = report ? statusLabels[report.status] : null
  const videoUrl = buildR2Url(contentDetail?.videoDetails?.objectKey)
  const isYoutubeVideo = contentDetail?.videoDetails?.platform === "YOUTUBE"
  const youtubeEmbedUrl =
    isYoutubeVideo && contentDetail?.videoDetails?.platformVideoId
      ? `https://www.youtube.com/embed/${contentDetail.videoDetails.platformVideoId}`
      : null

  const resolveReportMutation = useResolveAdminReport()
  const hideCourseMutation = useHideReportCourse()
  const banInstructorMutation = useBanReportInstructor()

  useEffect(() => {
    if (!open) {
      setResolutionNote("")
      setNoteError("")
      return
    }

    setResolutionNote("")
    setNoteError("")
  }, [open, report?.id])

  const isActionPending =
    resolveReportMutation.isPending ||
    hideCourseMutation.isPending ||
    banInstructorMutation.isPending

  const handleAction = async (action: "DISMISS" | "HIDE_COURSE" | "BAN_INSTRUCTOR") => {
    if (!report) return

    const note = resolutionNote.trim()
    if (!note) {
      setNoteError("Vui lòng nhập ghi chú xử lý trước khi gửi.")
      return
    }

    setNoteError("")

    if (action === "DISMISS") {
      await resolveReportMutation.mutateAsync({
        reportId: report.id,
        payload: { action: "DISMISS", resolutionNote: note },
      })
    }

    if (action === "HIDE_COURSE") {
      await hideCourseMutation.mutateAsync({
        reportId: report.id,
        payload: { resolutionNote: note },
      })
    }

    if (action === "BAN_INSTRUCTOR") {
      await banInstructorMutation.mutateAsync({
        reportId: report.id,
        payload: { resolutionNote: note },
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết báo cáo</DialogTitle>
          <DialogDescription>
            Thông tin báo cáo và nội dung bị phản ánh từ học viên.
          </DialogDescription>
        </DialogHeader>

        {isReportLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải chi tiết báo cáo...
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Người báo cáo</div>
                <div className="text-sm font-medium">{report.reporterUsername}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Trạng thái</div>
                {statusBadge ? (
                  <Badge className={statusBadge.className} variant="secondary">
                    {statusBadge.label}
                  </Badge>
                ) : (
                  <div className="text-sm font-medium">{report.status}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Loại đối tượng</div>
                <div className="text-sm font-medium">{report.targetType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Đối tượng ID</div>
                <div className="text-sm font-medium">{report.targetId}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lý do</div>
                <div className="text-sm font-medium">{report.reason}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Thời gian</div>
                <div className="text-sm font-medium">
                  {new Intl.DateTimeFormat("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(report.createdAt))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Mô tả</div>
                <div className="text-sm whitespace-pre-wrap text-slate-700">
                  {report.description || "-"}
                </div>
              </div>
            </div>

            {report.targetType === "COURSE" && (
              <Link
                href={`/courses/${report.targetId}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Xem khóa học công khai
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}

            {report.targetType === "CONTENT" && (
              <div className="rounded-lg border bg-white p-4 space-y-4">
                <div className="text-sm font-semibold">Nội dung bài học bị báo cáo</div>

                {isContentLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải nội dung bài học...
                  </div>
                ) : contentDetail ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Tiêu đề</div>
                        <div className="text-sm font-medium">{contentDetail.title}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Loại nội dung</div>
                        <div className="text-sm font-medium">{contentDetail.contentType}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-xs text-muted-foreground">Mô tả</div>
                        <div className="text-sm text-slate-700">
                          {contentDetail.description || "-"}
                        </div>
                      </div>
                    </div>

                    {contentDetail.contentType === "READING" && contentDetail.readingDetails && (
                      <div className="rounded-md border bg-slate-50 p-4">
                        <div className="text-xs text-muted-foreground mb-2">Nội dung bài đọc</div>
                        <div
                          className="prose max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: contentDetail.readingDetails.body }}
                        />
                      </div>
                    )}

                    {contentDetail.contentType === "VIDEO" && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Video</div>
                        {isYoutubeVideo && youtubeEmbedUrl ? (
                          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
                            <iframe
                              className="h-full w-full"
                              src={youtubeEmbedUrl}
                              title="Video báo cáo"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : videoUrl ? (
                          <video className="w-full rounded-lg border" controls src={videoUrl} />
                        ) : (
                          <div className="text-sm text-muted-foreground">Không tìm thấy video.</div>
                        )}
                      </div>
                    )}

                    {contentDetail.contentType === "QUIZ" && contentDetail.quizDetails && (
                      <div className="space-y-4">
                        <div className="text-xs text-muted-foreground">Quiz</div>
                        <div className="text-sm text-slate-700">
                          {contentDetail.quizDetails.description || "-"}
                        </div>
                        <div className="space-y-3">
                          {contentDetail.quizDetails.questions?.map((question, index) => (
                            <div key={question.id} className="rounded-md border p-3">
                              <div className="text-sm font-medium">
                                {index + 1}. {question.questionText}
                              </div>
                              <div className="mt-2 space-y-1 text-sm">
                                {question.options?.map((option) => (
                                  <div
                                    key={option.id}
                                    className={
                                      option.isCorrect
                                        ? "text-emerald-600 font-medium"
                                        : "text-slate-600"
                                    }
                                  >
                                    {option.optionText}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có dữ liệu nội dung.</div>
                )}
              </div>
            )}

            {report.status === "PENDING" && (
              <div className="rounded-lg border bg-slate-50 p-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold">Xử lý báo cáo</div>
                  <div className="text-xs text-muted-foreground">
                    Nhập ghi chú xử lý trước khi thực hiện một trong các hành động bên dưới.
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="Ví dụ: Not a valid complaint"
                    rows={4}
                  />
                  {noteError && <p className="text-sm text-destructive">{noteError}</p>}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAction("DISMISS")}
                    disabled={isActionPending}
                  >
                    {resolveReportMutation.isPending ? "Đang từ chối..." : "Dismiss"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleAction("BAN_INSTRUCTOR")}
                    disabled={isActionPending}
                  >
                    {banInstructorMutation.isPending ? "Đang khóa giảng viên..." : "Ban instructor"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleAction("HIDE_COURSE")}
                    disabled={isActionPending}
                  >
                    {hideCourseMutation.isPending ? "Đang ẩn khóa học..." : "Hide course"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Không có dữ liệu báo cáo.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
