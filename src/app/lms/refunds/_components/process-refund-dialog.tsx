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
import { useProcessRefund } from "@/hooks/queries/use-payment"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessRefundDialogProps {
  refundId: number | null
  status: 'APPROVED' | 'REJECTED' | null
  isOpen: boolean
  onClose: () => void
}

export function ProcessRefundDialog({ refundId, status, isOpen, onClose }: ProcessRefundDialogProps) {
  const [note, setNote] = React.useState("")
  const { mutate: processRefund, isPending } = useProcessRefund()

  React.useEffect(() => {
    if (isOpen) {
      setNote(status === 'APPROVED' ? "Tiền đã được hoàn thành công. Cảm ơn bạn đã quan tâm đến khóa học" : "")
    }
  }, [isOpen, status])

  const handleSubmit = () => {
    if (!refundId || !status) return

    processRefund(
      { refundId, payload: { status, note } },
      {
        onSuccess: () => {
          toast.success(status === 'APPROVED' ? "Đã duyệt hoàn tiền thành công" : "Đã từ chối yêu cầu hoàn tiền")
          setNote("")
          onClose()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi xử lý yêu cầu")
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {status === 'APPROVED' ? (
              <>
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                Duyệt hoàn tiền
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-destructive" />
                Từ chối hoàn tiền
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {status === 'APPROVED' 
              ? `Bạn đang duyệt hoàn tiền cho yêu cầu #${refundId}.` 
              : `Bạn đang từ chối yêu cầu hoàn tiền #${refundId}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú của Admin</label>
            <Textarea
              placeholder="Nhập ghi chú cho học viên..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px] rounded-xl border-zinc-200 focus:ring-indigo-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl" disabled={isPending}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            className={cn(
              "rounded-xl",
              status === 'APPROVED' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"
            )}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận {status === 'APPROVED' ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

