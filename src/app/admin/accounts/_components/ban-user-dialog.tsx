"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminUser } from "@/lib/services/admin-user.service"

interface BanUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSubmit: (reason: string, bannedUntil: string | null) => Promise<void>
  isLoading?: boolean
}

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading
}: BanUserDialogProps) {
  const [reason, setReason] = useState("")
  const [bannedUntil, setBannedUntil] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setReason("")
      setBannedUntil("")
      setError("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do khóa tài khoản.")
      return
    }

    try {
      let isoDate: string | null = null
      if (bannedUntil) {
        const date = new Date(bannedUntil)
        if (date <= new Date()) {
          setError("Thời hạn khóa phải lớn hơn thời gian hiện tại.")
          return
        }
        isoDate = date.toISOString()
      }
      
      await onSubmit(reason, isoDate)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            {user && (
              <>
                Khóa tài khoản <strong>{user.username}</strong>. Tài khoản này sẽ không thể đăng nhập vào hệ thống cho đến thời hạn bạn chọn.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-right">
              Lý do khóa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do vi phạm..."
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bannedUntil" className="text-right">
              Khóa đến thời gian
              <span className="ml-1 text-xs text-muted-foreground font-normal">(để trống = vĩnh viễn)</span>
            </Label>
            <Input
              id="bannedUntil"
              type="datetime-local"
              value={bannedUntil}
              onChange={(e) => setBannedUntil(e.target.value)}
              className="col-span-3"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Khóa tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
