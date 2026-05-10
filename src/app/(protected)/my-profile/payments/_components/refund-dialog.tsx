"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRequestRefund } from "@/hooks/queries/use-payment"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"

interface RefundDialogProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
}

export function RefundDialog({ orderId, isOpen, onClose }: RefundDialogProps) {
  const [reason, setReason] = React.useState("")
  const { mutate: requestRefund, isPending } = useRequestRefund()

  const handleSubmit = () => {
    if (!orderId) return
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền")
      return
    }

    requestRefund(
      { orderId, reason },
      {
        onSuccess: () => {
          toast.success("Yêu cầu của bạn sẽ được xử lý trong 12h", {
            description: "Chúng tôi đã ghi nhận yêu cầu hoàn tiền của bạn.",
            icon: <AlertCircle className="h-5 w-5 text-emerald-500" />,
          })
          setReason("")
          onClose()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi gửi yêu cầu")
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Yêu cầu hoàn tiền</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn hoàn tiền cho đơn hàng #{orderId}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Nhập lý do hoàn tiền (ví dụ: Nội dung không phù hợp, lỗi kỹ thuật...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[120px] rounded-xl border-zinc-200 focus:ring-indigo-500"
          />
          <p className="text-xs text-muted-foreground flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            Lưu ý: Yêu cầu hoàn tiền chỉ được chấp nhận nếu tiến độ học tập dưới 30% và trong vòng 30 ngày kể từ khi thanh toán.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl" disabled={isPending}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
