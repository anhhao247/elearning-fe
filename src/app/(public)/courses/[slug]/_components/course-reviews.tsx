"use client"

import { CourseReview } from "@/types/course"
import { Star, Filter, Edit3 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CourseReviewsProps {
  reviews: CourseReview[]
  ratingDistribution?: Record<string, number>
  avgRating: number
  totalReviews: number
}

export function CourseReviews({
  reviews,
  ratingDistribution,
  avgRating,
  totalReviews,
}: CourseReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <section className="bg-card rounded-xl p-8 border text-center">
        <h2 className="text-2xl font-bold mb-2">Đánh giá học viên</h2>
        <p className="text-muted-foreground mb-6">Khóa học này chưa có đánh giá nào.</p>
        <Button variant="outline" className="gap-2">
          <Edit3 className="w-4 h-4" /> Viết đánh giá đầu tiên
        </Button>
      </section>
    )
  }

  // Chuyển distribution thành mảng và sắp xếp 5 -> 1
  const distributions = [5, 4, 3, 2, 1].map((rating) => {
    const pt = ratingDistribution ? ratingDistribution[rating.toString()] || 0 : 0
    return {
      rating,
      percentage: pt,
    }
  })

  return (
    <section className="bg-card rounded-xl p-6 md:p-8 border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Đánh giá học viên</h2>
        <div className="flex gap-3">
          <Button variant="default" className="font-semibold shadow-sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Viết đánh giá
          </Button>
          <Button variant="outline" className="font-semibold">
            <Filter className="w-4 h-4 mr-2" />
            Lọc đánh giá
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border/50">
          <span className="text-6xl font-black text-foreground drop-shadow-sm">
            {avgRating?.toFixed(2) || "0.00"}
          </span>
          <div className="flex text-yellow-400 my-4 drop-shadow-sm">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(avgRating) ? "fill-current" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Trung bình <span>•</span> {totalReviews} đánh giá
          </span>
        </div>

        <div className="md:col-span-8 flex flex-col justify-center gap-3">
          {distributions.map((item) => (
            <div key={item.rating} className="flex items-center gap-4 text-sm font-medium">
              <div className="flex text-yellow-400 gap-1 w-24">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < item.rating ? "fill-current" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-muted-foreground tabular-nums">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold">Mới nhất</h3>
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={review.reviewerAvatar || ""}
                    alt={review.reviewerName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {review.reviewerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base">{review.reviewerName}</h4>
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 drop-shadow-sm pb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? "fill-current" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground/90 leading-relaxed text-sm">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
