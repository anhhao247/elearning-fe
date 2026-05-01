"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addReview } from "@/lib/services/course.service"

const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn mức đánh giá").max(5),
  comment: z.string().min(5, "Nội dung đánh giá phải có ít nhất 5 ký tự").max(500, "Nội dung quá dài"),
})

const RATINGS = [
  { value: 1, label: "Rất tệ", emoji: "😡" },
  { value: 2, label: "Tệ", emoji: "😕" },
  { value: 3, label: "Bình thường", emoji: "😐" },
  { value: 4, label: "Tốt", emoji: "🙂" },
  { value: 5, label: "Rất tuyệt vời", emoji: "🤩" },
]

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewDialogProps {
  courseId: number
  courseTitle: string
  isOpen: boolean
  onClose: () => void
}

export function ReviewDialog({ courseId, courseTitle, isOpen, onClose }: ReviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const queryClient = useQueryClient()

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  })

  const onSubmit = async (values: ReviewFormValues) => {
    setIsLoading(true)
    try {
      await addReview(courseId, values)
      toast.success("Cảm ơn bạn đã đánh giá khóa học!")
      
      // Refresh course detail data to show new review
      queryClient.invalidateQueries({ queryKey: ["courseDetail"] })
      
      form.reset()
      onClose()
    } catch (error: any) {
      console.error("Add review error:", error)
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi gửi đánh giá")
    } finally {
      setIsLoading(false)
    }
  }

  const currentRating = hoveredRating || form.watch("rating")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Viết đánh giá cho khóa học</DialogTitle>
          <DialogDescription className="line-clamp-1">
            Khóa học: {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center space-y-4 py-2">
                  <FormLabel className="text-base font-semibold">Mức độ hài lòng của bạn?</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      {RATINGS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`text-4xl transition-all duration-200 transform hover:scale-125 focus:outline-none ${
                            currentRating === item.value 
                              ? "grayscale-0 scale-125" 
                              : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                          }`}
                          onClick={() => field.onChange(item.value)}
                          onMouseEnter={() => setHoveredRating(item.value)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 min-h-[1.25rem] transition-all">
                    {RATINGS.find(r => r.value === currentRating)?.label}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung đánh giá</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                      className="min-h-[120px] rounded-xl focus-visible:ring-primary"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi đánh giá
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
