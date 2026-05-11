"use client"

import { useState } from "react"
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/queries/use-learning"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Loader2, Plus, X, Edit2, Trash2, StickyNote, FileText } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { UserNote } from "@/types/learning"

interface NotesPanelProps {
  courseId: number
  contentId: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function NotesPanel({ courseId, contentId, isOpen, setIsOpen }: NotesPanelProps) {
  return (
    <>
      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b flex justify-between items-center bg-muted/30 shrink-0">
          <h2 className="font-bold text-base flex items-center gap-2 text-foreground">
            <StickyNote className="w-4.5 h-4.5 text-primary" />
            Studio Ghi Chú
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <NotesContent courseId={courseId} contentId={contentId} />
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export function NotesContent({ courseId, contentId }: { courseId: number, contentId: number }) {
  const { data: notes, isLoading } = useNotes(courseId, contentId)
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()

  const [isEditing, setIsEditing] = useState(false)
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const courseNotes = notes || []

  const resetForm = () => {
    setTitle("")
    setBody("")
    setIsEditing(false)
    setCurrentNoteId(null)
  }

  const handleSave = async () => {
    if (!body || body === "<p><br></p>") {
      toast.error("Vui lòng nhập nội dung ghi chú")
      return
    }

    try {
      if (currentNoteId) {
        await updateNoteMutation.mutateAsync({
          id: currentNoteId,
          payload: { title: title || null, body }
        })
        toast.success("Đã cập nhật ghi chú")
      } else {
        await createNoteMutation.mutateAsync({
          courseId,
          contentId,
          title: title || null,
          body
        })
        toast.success("Đã thêm ghi chú mới")
      }
      resetForm()
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi lưu ghi chú")
    }
  }

  const handleEdit = (note: UserNote) => {
    setTitle(note.title || "")
    setBody(note.body)
    setCurrentNoteId(note.id)
    setIsEditing(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      try {
        await deleteNoteMutation.mutateAsync(id)
        toast.success("Đã xóa ghi chú")
      } catch (error) {
        toast.error("Không thể xóa ghi chú")
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 p-3">
      {!isEditing ? (
        <>
          <Button 
            onClick={() => setIsEditing(true)} 
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm ghi chú mới
          </Button>

          <div className="space-y-4 mt-6">
            {courseNotes.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-sm">Chưa có ghi chú nào cho khóa học này.</p>
              </div>
            ) : (
              courseNotes.map((note) => (
                <div key={note.id} className="bg-card border rounded-xl p-4 group shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{note.title || "Ghi chú không tên"}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(note)} className="p-1.5 text-muted-foreground hover:text-primary bg-muted rounded-md">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-1.5 text-muted-foreground hover:text-destructive bg-muted rounded-md">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-3 mb-3 ql-editor px-0 py-0 min-h-0"
                    dangerouslySetInnerHTML={{ __html: note.body }}
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t">
                    <span>Bài học #{note.contentId}</span>
                    <span>
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tiêu đề (không bắt buộc)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ghi chú..."
              className="w-full bg-background border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nội dung</label>
            <div className="bg-background rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-primary/50">
              <RichTextEditor 
                value={body}
                onChange={setBody}
                placeholder="Ghi lại những điều quan trọng..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {(createNoteMutation.isPending || updateNoteMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Lưu ghi chú
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
