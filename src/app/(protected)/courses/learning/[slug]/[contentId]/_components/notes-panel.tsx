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
}

export function NotesPanel({ courseId, contentId }: NotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="rounded-full shadow-xl bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 py-6"
        >
          <FileText className="w-5 h-5" />
          <span className="font-semibold">Ghi chú của tôi</span>
        </Button>
      </div>

      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-slate-950 text-slate-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-indigo-400" />
            Studio Ghi Chú
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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

function NotesContent({ courseId, contentId }: { courseId: number, contentId: number }) {
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
    return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <Button 
            onClick={() => setIsEditing(true)} 
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm ghi chú mới
          </Button>

          <div className="space-y-4 mt-6">
            {courseNotes.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm">Chưa có ghi chú nào cho khóa học này.</p>
              </div>
            ) : (
              courseNotes.map((note) => (
                <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-100 line-clamp-1">{note.title || "Ghi chú không tên"}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(note)} className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-md">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-md">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none line-clamp-3 mb-3"
                    dangerouslySetInnerHTML={{ __html: note.body }}
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500">
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
            <label className="text-sm font-medium text-slate-300">Tiêu đề (không bắt buộc)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ghi chú..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nội dung</label>
            <div className="bg-white rounded-lg overflow-hidden">
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
              className="flex-1 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
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
