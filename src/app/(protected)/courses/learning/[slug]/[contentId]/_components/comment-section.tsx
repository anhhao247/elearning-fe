"use client"

import { useState } from "react"
import { useComments, useCreateComment } from "@/hooks/queries/use-learning"
import { ContentComment } from "@/types/learning"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare, Reply, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CommentSectionProps {
  contentId: number
}

export function CommentSection({ contentId }: CommentSectionProps) {
  const { user } = useAuthStore()
  const { data: comments, isLoading } = useComments(contentId)
  const [commentText, setCommentText] = useState("")
  const createCommentMutation = useCreateComment(contentId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      await createCommentMutation.mutateAsync({
        commentContent: commentText,
      })
      setCommentText("")
      toast.success("Bình luận của bạn đã được gửi")
    } catch (error) {
      toast.error("Không thể gửi bình luận. Vui lòng thử lại.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Input Section */}
      <div className="flex gap-4">
        <Avatar className="w-10 h-10 border shadow-sm shrink-0">
          <AvatarImage src={user?.avatar || ""} alt={user?.username} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <Textarea
            placeholder="Bạn có thắc mắc gì về bài học này không?"
            className="min-h-[100px] rounded-2xl resize-none focus-visible:ring-primary border-slate-200"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!commentText.trim() || createCommentMutation.isPending}
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Gửi bình luận
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {comments?.length || 0} bình luận
        </h3>

        {comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                contentId={contentId} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-2xl bg-slate-50/50">
            <p className="text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: ContentComment
  contentId: number
  isReply?: boolean
}

function CommentItem({ comment, contentId, isReply = false }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [replyText, setReplyText] = useState("")
  const createCommentMutation = useCreateComment(contentId)
  const { user } = useAuthStore()

  const handleReply = async () => {
    if (!replyText.trim()) return
    try {
      await createCommentMutation.mutateAsync({
        commentContent: replyText,
        parentId: comment.id
      })
      setReplyText("")
      setIsReplying(false)
      setIsExpanded(true) // Tự động mở rộng khi có phản hồi mới
      toast.success("Phản hồi đã được gửi")
    } catch (error) {
      toast.error("Không thể gửi phản hồi")
    }
  }

  const timeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
    } catch (e) {
      return "vừa xong"
    }
  }

  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={cn("flex gap-3", isReply && "mt-4")}>
      <Avatar className={cn("border shadow-sm shrink-0", isReply ? "w-8 h-8" : "w-10 h-10")}>
        <AvatarImage src={comment.avatar || ""} alt={comment.username} className="object-cover" />
        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-xs">
          {comment.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-sm">{comment.username}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.commentContent}</p>
        </div>

        <div className="flex items-center gap-4 mt-1.5 ml-1">
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-bold text-muted-foreground hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <Reply className="w-3 h-3" />
            Phản hồi
          </button>

          {hasReplies && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              {isExpanded ? (
                <>Ẩn phản hồi</>
              ) : (
                <>Xem {comment.replies.length} phản hồi</>
              )}
            </button>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Avatar className="w-8 h-8 border shadow-sm shrink-0">
              <AvatarImage src={user?.avatar || ""} alt={user?.username} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`Phản hồi ${comment.username}...`}
                className="min-h-[80px] rounded-xl resize-none focus-visible:ring-primary text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsReplying(false)}
                  className="rounded-lg text-xs"
                >
                  Hủy
                </Button>
                <Button 
                  size="sm" 
                  disabled={!replyText.trim() || createCommentMutation.isPending}
                  onClick={handleReply}
                  className="rounded-lg text-xs bg-indigo-600"
                >
                  {createCommentMutation.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  Trả lời
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="mt-2 border-l-2 border-slate-100 dark:border-slate-800 ml-1 pl-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                contentId={contentId} 
                isReply={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
