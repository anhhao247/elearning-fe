"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Check, X } from "lucide-react"
import { InstructorApplication } from "@/types/instructor-application"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Extend Table Meta to include our handlers
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onApprove?: (id: number) => Promise<void>
    onReject?: (id: number, reason: string) => Promise<void>
  }
}

const ActionCell = ({ row, table }: { row: any, table: any }) => {
  const application = row.original as InstructorApplication
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = async () => {
    await table.options.meta?.onApprove?.(application.profileId)
    setIsApproveOpen(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    await table.options.meta?.onReject?.(application.profileId, rejectReason)
    setIsRejectOpen(false)
    setRejectReason("")
  }

  const organizations = Array.isArray(application.affiliations) 
    ? application.affiliations 
    : application.affiliations?.organizations || []

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-green-600 focus:text-green-600"
            onClick={() => setIsApproveOpen(true)}
          >
            <Check className="mr-2 h-4 w-4" />
            Phê duyệt
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600"
            onClick={() => setIsRejectOpen(true)}
          >
            <X className="mr-2 h-4 w-4" />
            Từ chối
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn đăng ký giảng viên</DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ của {application.firstName} {application.lastName}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Họ tên</Label>
                <div className="col-span-3">{application.firstName} {application.lastName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Email</Label>
                <div className="col-span-3">{application.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Chức danh</Label>
                <div className="col-span-3">{application.headline}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-bold mt-1">Giới thiệu</Label>
                <div className="col-span-3 text-sm whitespace-pre-wrap">{application.bio}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-bold mt-1">Tổ chức</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {organizations.length > 0 ? (
                    organizations.map((org: string, i: number) => (
                      <Badge key={i} variant="secondary">{org}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Không có thông tin</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Mạng xã hội</Label>
                <div className="col-span-3 flex flex-col gap-1 text-sm">
                  {application.facebookUrl && <a href={application.facebookUrl} target="_blank" className="text-blue-600 hover:underline">Facebook</a>}
                  {application.linkedinUrl && <a href={application.linkedinUrl} target="_blank" className="text-blue-600 hover:underline">LinkedIn</a>}
                  {application.twitterUrl && <a href={application.twitterUrl} target="_blank" className="text-blue-600 hover:underline">Twitter</a>}
                  {application.websiteUrl && <a href={application.websiteUrl} target="_blank" className="text-blue-600 hover:underline">Website</a>}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Approve AlertDialog */}
      <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt cho <strong>{application.firstName} {application.lastName}</strong> trở thành giảng viên?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Phê duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối cho đơn của <strong>{application.firstName} {application.lastName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">Lý do</Label>
              <Input
                id="reason"
                className="col-span-3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Hồ sơ chưa đủ kinh nghiệm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columns: ColumnDef<InstructorApplication>[] = [
  {
    accessorKey: "fullName",
    header: "Họ và tên",
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      return <div className="font-medium">{firstName} {lastName}</div>
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "headline",
    header: "Chức danh",
    cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.original.headline}>{row.original.headline}</div>
  },
  {
    accessorKey: "createdAt",
    header: "Ngày nộp",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return <div>{new Intl.DateTimeFormat("vi-VN").format(date)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ActionCell row={row} table={table} />,
  },
]
