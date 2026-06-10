"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useCreateReport } from "@/hooks/queries/use-create-report"
import { ReportTargetType } from "@/lib/services/report.service"

const reportSchema = z
  .object({
    reason: z.string().min(1, "Vui lòng chọn lý do báo cáo"),
    description: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.reason === "OTHER" && !values.description?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Vui lòng nhập mô tả chi tiết",
      })
    }
  })

const REASONS = [
  { value: "INAPPROPRIATE", label: "Nội dung không phù hợp" },
  { value: "SPAM", label: "Spam / Quảng cáo" },
  { value: "COPYRIGHT", label: "Vi phạm bản quyền" },
  { value: "OTHER", label: "Khác" },
]

type ReportFormValues = z.infer<typeof reportSchema>

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: ReportTargetType
  targetId: number
  subjectLabel: string
  subjectName?: string
}

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  subjectLabel,
  subjectName,
}: ReportDialogProps) {
  const { mutateAsync, isPending } = useCreateReport()

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: REASONS[0].value,
      description: "",
    },
  })

  const reason = form.watch("reason")
  const { errors } = form.formState

  useEffect(() => {
    if (!open) {
      form.reset({ reason: REASONS[0].value, description: "" })
    }
  }, [form, open])

  const onSubmit = async (values: ReportFormValues) => {
    const payload = {
      targetType,
      targetId,
      reason: values.reason,
      description: values.reason === "OTHER" ? values.description?.trim() : undefined,
    }

    await mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Báo cáo {subjectLabel}</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {subjectName ? `${subjectLabel}: ${subjectName}` : "Vui lòng cung cấp chi tiết vi phạm."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chon ly do" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.reason && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.reason.message as string}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {reason === "OTHER" && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết vi phạm..."
                        className="min-h-30"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description.message as string}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi báo cáo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
