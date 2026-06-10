import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { CreateReportPayload, ReportService } from "@/lib/services/report.service"

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => ReportService.createReport(payload),
    onSuccess: () => {
      toast.success("Gửi báo cáo thành công. Cảm ơn bạn!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại.")
    },
  })
}
