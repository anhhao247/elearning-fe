"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray, FieldErrors } from "react-hook-form"
import { useInstructorContent } from "@/hooks/queries/use-instructor"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Plus, Edit2, PlaySquare, FileText, HelpCircle, Clock, Trash2, PlusCircle, ClipboardPaste, CheckCircle2, AlertCircle } from "lucide-react"
import { DurationPicker } from "@/components/ui/duration-picker"
import { Checkbox } from "@/components/ui/checkbox"

const lessonSchema = z.object({
  title: z.string().min(1, "Tên bài giảng là bắt buộc"),
  contentType: z.enum(["VIDEO", "READING", "QUIZ"]),
  isPublish: z.boolean().default(true),

  // VIDEO fields
  platform: z.enum(["YOUTUBE", "CLOUDFLARE"]).optional(),
  videoId: z.string().optional(),

  // Shared by VIDEO & QUIZ
  duration: z.coerce.number().optional(),

  // READING fields
  body: z.string().optional(),

  // QUIZ fields
  description: z.string().optional(),
  passPercent: z.coerce.number().optional(),
  questions: z.array(z.object({
    id: z.number().optional(),
    questionText: z.string().min(1, "Vui lòng nhập nội dung câu hỏi"),
    questionType: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE"]),
    options: z.array(z.object({
      id: z.number().optional(),
      optionText: z.string().min(1, "Vui lòng nhập nội dung đáp án"),
      isCorrect: z.boolean().default(false)
    })).min(2, "Cần ít nhất 2 đáp án")
  })).optional(),
  _originalQuestionIds: z.array(z.number()).optional(),
  _originalData: z.any().optional()
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LessonFormValues) => void
  initialData?: any
  isSubmitting?: boolean
  mode: "create" | "edit"
  contentId?: number | null
  contentType?: string
}

// ─── Bulk Import Dialog ────────────────────────────────────────────────────────

/**
 * Converts plain-text question content (with optional code blocks and markdown tables)
 * into Quill-compatible HTML so it renders correctly in the RichTextEditor.
 *
 * Supported syntax:
 *   - ```lang ... ``` → <pre class="ql-syntax">...</pre>
 *   - | col | col |   → <table> with thead/tbody
 *   - Plain text lines → <p>...</p>
 */
function convertToQuillHtml(text: string): string {
  const lines = text.split("\n")
  const parts: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // ── Code block: ```lang ... ``` ──────────────────────────
    if (line.startsWith("```")) {
      const codeLines: string[] = []
      i++ // skip opening ```
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const escaped = codeLines
        .join("\n")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      parts.push(`<pre class="ql-syntax">${escaped}</pre>`)
      continue
    }

    // ── Markdown table: lines starting with | ────────────────
    if (line.startsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      // Filter out separator rows (|---|---|)
      const rows = tableLines.filter(l => !/^\|[\s|:-]+\|$/.test(l))
      if (rows.length > 0) {
        const parseRow = (r: string) =>
          r.split("|").slice(1, -1).map(cell => cell.trim())

        const [headerRow, ...bodyRows] = rows
        const headers = parseRow(headerRow)

        const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>`
        const tbody = bodyRows.length
          ? `<tbody>${bodyRows.map(r => `<tr>${parseRow(r).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`
          : ""
        parts.push(`<table>${thead}${tbody}</table>`)
      }
      continue
    }

    // ── Plain text line ──────────────────────────────────────
    if (line.trim()) {
      parts.push(`<p>${line.trim()}</p>`)
    }
    i++
  }

  return parts.join("")
}

/**
 * Bulk Import Format:
 *
 * Q: Question text (plain or with code/table)
 * ```js
 * console.log(typeof null)
 * ```
 * A. null
 * B. object*
 *
 * Markdown table example:
 * Q: So sánh các từ khóa khai báo biến
 * | Từ khóa | Phạm vi | Gán lại |
 * |---------|---------|---------|
 * | var     | function | Được   |
 * | let     | block    | Được   |
 * | const   | block    | Không  |
 * A. var có phạm vi block*
 * B. const không thể gán lại*
 */
function parseBulkImport(raw: string): { parsed: any[]; errors: string[] } {
  const lines = raw.split("\n")
  const parsed: any[] = []
  const errors: string[] = []
  
  let currentBlock: string[] = []
  let inCode = false

  // Helper to process a block of lines into a question object
  const processBlock = (blockLines: string[], blockIndex: number) => {
    if (!blockLines.length) return

    const qLines: string[] = []
    const optionLines: string[] = []
    let foundOptions = false

    for (const line of blockLines) {
      const trimmed = line.trim()
      if (!trimmed && !inCode) continue

      // Detect if this line is an option (e.g., A. Option)
      if (/^[A-Za-z]\./.test(trimmed)) {
        foundOptions = true
        optionLines.push(trimmed)
      } else if (!foundOptions) {
        // Still in question text
        qLines.push(line.replace(/^Q:\s*/i, "").replace(/^Câu\s*\d+[:.]?\s*/i, ""))
      } else {
        // Line after options started - could be a sub-line of an option or trailing text
        // For robustness, if it doesn't look like an option, we'll append it to the last option
        if (optionLines.length > 0) {
          optionLines[optionLines.length - 1] += "\n" + trimmed
        }
      }
    }

    if (!qLines.filter(l => l.trim()).length) {
      // If we only have options but no question, ignore or log error
      return
    }

    if (optionLines.length < 2) {
      errors.push(`Khối ${blockIndex + 1}: Cần ít nhất 2 đáp án (A. B. C. ...).`)
      return
    }

    const options = optionLines.map(line => {
      const isCorrect = line.endsWith("*")
      const text = line.replace(/^[A-Za-z]\.\s*/, "").replace(/\*$/, "").trim()
      return { optionText: text, isCorrect }
    })

    const correctCount = options.filter(o => o.isCorrect).length
    const questionType = correctCount > 1 ? "MULTI_CHOICE" : "SINGLE_CHOICE"
    const questionHtml = convertToQuillHtml(qLines.join("\n"))

    parsed.push({
      questionText: questionHtml,
      questionType,
      options,
    })
  }

  let blockIdx = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Toggle code mode on ``` markers
    if (trimmed.startsWith("```")) {
      inCode = !inCode
      // Only add the ``` line to block if opening (to track it for convertToQuillHtml)
      if (inCode) {
        currentBlock.push(line)
      }
      // On closing ```, also add it
      else {
        currentBlock.push(line)
      }
      continue
    }

    // Auto-close code block if we hit an answer line (A. text) or new Q: while inCode
    if (inCode && (/^[A-Za-z]\.\s/.test(trimmed) || /^Q:\s*/i.test(trimmed) || /^Câu\s*\d+[:.]/i.test(trimmed))) {
      // Force-close the code block by adding closing ```
      currentBlock.push("```")
      inCode = false
    }

    const isNewQuestionMarker = !inCode && (
      /^Q:\s*/i.test(trimmed) ||
      /^Câu\s*\d+[:.]/i.test(trimmed)
    )

    const isBlankLine = !inCode && trimmed === ""

    if (isNewQuestionMarker && currentBlock.length > 0) {
      processBlock(currentBlock, blockIdx++)
      currentBlock = [line]
    } else if (isBlankLine && currentBlock.length > 0) {
      processBlock(currentBlock, blockIdx++)
      currentBlock = []
    } else {
      if (trimmed || inCode || currentBlock.length > 0) {
        currentBlock.push(line)
      }
    }
  }

  // Process the final block
  if (currentBlock.length) {
    // If still in code block, close it
    if (inCode) currentBlock.push("```")
    processBlock(currentBlock, blockIdx)
  }

  return { parsed, errors }
}

function BulkImportDialog({ onImport }: { onImport: (questions: any[]) => void }) {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState("")
  const [preview, setPreview] = useState<{ parsed: any[]; errors: string[] } | null>(null)

  const handlePreview = () => {
    const result = parseBulkImport(raw)
    setPreview(result)
  }

  const handleImport = () => {
    if (!preview || !preview.parsed.length) return
    onImport(preview.parsed)
    setOpen(false)
    setRaw("")
    setPreview(null)
  }

  const EXAMPLE = `Q: Kết quả của đoạn code sau là gì?\nconsole.log(typeof null)\nA. null\nB. object*\nC. undefined\nD. string\n\nQ: Các từ khóa nào dùng để khai báo biến trong JS?\nA. var*\nB. let*\nC. const*\nD. int`

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        onClick={() => setOpen(true)}
      >
        <ClipboardPaste className="h-4 w-4" />
        Nhập hàng loạt
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[680px] bg-white flex flex-col max-h-[90vh]">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ClipboardPaste className="w-5 h-5 text-blue-500" />
              Nhập câu hỏi hàng loạt
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Format guide */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1 border">
              <p className="font-semibold text-slate-700 mb-2">📋 Định dạng nhập liệu:</p>
              <p className="text-slate-600">• <code className="bg-slate-200 px-1 rounded">Q:</code> — Nội dung câu hỏi (hoặc không cần Q:)</p>
              <p className="text-slate-600">• <code className="bg-slate-200 px-1 rounded">A. B. C.</code> — Các đáp án</p>
              <p className="text-slate-600">• Thêm <code className="bg-slate-200 px-1 rounded">*</code> vào cuối đáp án đúng: <code className="bg-slate-200 px-1 rounded">B. object*</code></p>
              <p className="text-slate-600">• Nhiều đáp án đúng → tự động thành MULTI_CHOICE</p>
              <p className="text-slate-600">• Ngăn cách các câu hỏi bằng <strong>1 dòng trống</strong></p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Nội dung câu hỏi</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 h-7"
                  onClick={() => setRaw(EXAMPLE)}
                >
                  Dùng ví dụ mẫu
                </Button>
              </div>
              <Textarea
                value={raw}
                onChange={e => { setRaw(e.target.value); setPreview(null) }}
                placeholder={`Q: Câu hỏi thứ nhất\nA. Đáp án A\nB. Đáp án B*\nC. Đáp án C\n\nQ: Câu hỏi thứ hai\nA. Option 1*\nB. Option 2`}
                className="min-h-[200px] font-mono text-sm resize-none bg-slate-50"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                {preview.errors.length > 0 && (
                  <div className="space-y-1">
                    {preview.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded p-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {e}
                      </div>
                    ))}
                  </div>
                )}

                {preview.parsed.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Nhận diện được {preview.parsed.length} câu hỏi
                    </p>
                    {preview.parsed.map((q, i) => (
                      <div key={i} className="border rounded-lg p-3 bg-white text-sm space-y-1">
                        <p className="font-medium text-slate-800">
                          {i + 1}. {q.questionText.length > 80 ? q.questionText.slice(0, 80) + "..." : q.questionText}
                        </p>
                        <p className="text-xs text-slate-500">{q.questionType === "MULTI_CHOICE" ? "Nhiều đáp án" : "Một đáp án"} • {q.options.length} lựa chọn</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.options.map((opt: any, oi: number) => (
                            <span key={oi} className={`text-xs px-2 py-0.5 rounded-full ${
                              opt.isCorrect ? "bg-green-100 text-green-700 font-semibold" : "bg-slate-100 text-slate-600"
                            }`}>
                              {String.fromCharCode(65 + oi)}. {opt.optionText.length > 30 ? opt.optionText.slice(0, 30) + "..." : opt.optionText}
                              {opt.isCorrect && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
            {!preview ? (
              <Button type="button" onClick={handlePreview} disabled={!raw.trim()}
                className="bg-slate-800 text-white hover:bg-slate-700">
                Xem trước
              </Button>
            ) : (
              <Button type="button" onClick={handleImport} disabled={!preview.parsed.length}
                className="bg-blue-600 text-white hover:bg-blue-700">
                Nhập {preview.parsed.length} câu hỏi
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Quiz Questions Component ────────────────────────────────────────────────────

function QuizQuestions({ control, register, errors, watch, setValue }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  })

  const handleBulkImport = (questions: any[]) => {
    questions.forEach(q => append(q))
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <QuizQuestionItem
          key={field.id}
          index={index}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => remove(index)}
          watch={watch}
          setValue={setValue}
        />
      ))}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-dashed border-2 py-6 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          onClick={() => append({
            questionText: "",
            questionType: "SINGLE_CHOICE",
            options: [{ optionText: "", isCorrect: false }, { optionText: "", isCorrect: false }]
          })}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm câu hỏi
        </Button>
        <BulkImportDialog onImport={handleBulkImport} />
      </div>
    </div>
  )
}

function QuizQuestionItem({ index, control, register, errors, onRemove, watch, setValue }: any) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`
  })

  const questionType = watch(`questions.${index}.questionType`)

  // Handle SINGLE_CHOICE exclusivity
  const handleCorrectChange = (optIdx: number, checked: boolean) => {
    if (questionType === "SINGLE_CHOICE" && checked) {
      // Uncheck all other options
      optionFields.forEach((_, i) => {
        if (i !== optIdx) {
          setValue(`questions.${index}.options.${i}.isCorrect`, false)
        }
      })
    }
    setValue(`questions.${index}.options.${optIdx}.isCorrect`, checked)
  }

  return (
    <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
      <div className="flex items-start justify-between">
        <h5 className="font-bold text-slate-700">Câu hỏi {index + 1}</h5>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_150px] gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Nội dung câu hỏi</Label>
          <Controller
            control={control}
            name={`questions.${index}.questionText`}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Nhập câu hỏi (có thể chèn code/bảng)..."
                className="min-h-[120px]"
              />
            )}
          />
          {errors?.questions?.[index]?.questionText && (
            <p className="text-xs text-red-500">{errors.questions[index].questionText.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Loại câu hỏi</Label>
          <Controller
            control={control}
            name={`questions.${index}.questionType`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Một đáp án</SelectItem>
                  <SelectItem value="MULTI_CHOICE">Nhiều đáp án</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2 pl-4 border-l-2 border-slate-100">
        <Label className="text-xs text-slate-500">Các đáp án</Label>

        {optionFields.map((optField, optIdx) => (
          <div key={optField.id} className="flex items-center gap-3">
            <Controller
              control={control}
              name={`questions.${index}.options.${optIdx}.isCorrect`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => handleCorrectChange(optIdx, checked as boolean)}
                />
              )}
            />
            <Input
              {...register(`questions.${index}.options.${optIdx}.optionText`)}
              placeholder={`Đáp án ${optIdx + 1}`}
              className="flex-1 h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              onClick={() => removeOption(optIdx)}
              disabled={optionFields.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {errors?.questions?.[index]?.options && typeof errors.questions[index].options.message === 'string' && (
          <p className="text-xs text-red-500">{errors.questions[index].options.message}</p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 text-xs"
          onClick={() => appendOption({ optionText: "", isCorrect: false })}
        >
          <Plus className="h-3 w-3 mr-1" /> Thêm đáp án
        </Button>
      </div>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function LessonDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  mode,
  contentId,
  contentType,
}: LessonDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: initialData || { title: "", contentType: "READING", isPublish: true }
  })

  // Fetch full content detail when editing
  const editContentId = mode === "edit" && open ? (contentId ?? null) : null
  const { data: contentDetail, isLoading: isLoadingDetail } = useInstructorContent(editContentId, contentType)

  // Track if the form has been reset with real data (prevents flash of empty form)
  const [formReady, setFormReady] = useState(false)

  // Reset formReady whenever dialog closes
  useEffect(() => {
    if (!open) setFormReady(false)
  }, [open])

  // Populate form when content detail is fetched
  useEffect(() => {
    if (mode === "edit" && contentDetail) {
      const d = contentDetail
      const det = d.details
      const mapped: any = {
        title: d.title,
        contentType: d.contentType,
        isPublish: d.isPublish ?? true,
        platform: "YOUTUBE",
        videoId: "",
        duration: 0,
        body: "",
        description: "",
        passPercent: 80,
        questions: undefined,
      }

      if (det?.type === "video") {
        mapped.platform = det.platform || "YOUTUBE"
        mapped.videoId = det.videoId || ""
        mapped.duration = det.duration || 0
      } else if (det?.type === "reading") {
        mapped.body = det.body || ""
      } else if (det?.type === "quiz") {
        mapped.description = det.description || ""
        mapped.passPercent = det.passPercent || 80
        mapped.duration = det.duration || 0
        mapped.questions = det.questions?.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType || "SINGLE_CHOICE",
          options: q.options?.map((opt: any) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })) || [],
        }))
        // Store original question IDs for deletion diff
        mapped._originalQuestionIds = det.questions?.map((q: any) => q.id).filter(Boolean) || []
      }

      // Snapshot for optimization (General/Details comparison)
      mapped._originalData = {
        title: d.title,
        description: mapped.description || "",
        isPublish: d.isPublish,
        contentType: d.contentType,
        platform: mapped.platform,
        videoId: mapped.videoId,
        duration: mapped.duration,
        body: mapped.body,
        passPercent: mapped.passPercent,
        questions: mapped.questions ? JSON.parse(JSON.stringify(mapped.questions)) : []
      }

      reset(mapped)
      setFormReady(true)
    }
  }, [contentDetail, mode, reset])

  // Reset to blank for create mode
  useEffect(() => {
    if (open && mode === "create") {
      reset({
        title: "",
        contentType: "VIDEO",
        isPublish: true,
        platform: "YOUTUBE",
        videoId: "",
        duration: 0,
        body: "",
        description: "",
        passPercent: 80,
        questions: []
      })
      setFormReady(true)
    }
  }, [open, mode, reset])

  const currentType = watch("contentType")

  const onInvalid = (errors: FieldErrors<LessonFormValues>) => {
    const errorKeys = Object.keys(errors) as (keyof LessonFormValues)[];
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const elementMap: Record<string, string> = {
        title: "lesson-title",
        contentType: "lesson-contentType",
        duration: "lesson-duration",
        videoId: "lesson-video-details",
        body: "lesson-reading-content",
        description: "lesson-quiz-details",
        questions: "lesson-quiz-details",
      };

      const elementId = elementMap[firstError];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focus if it's focusable
          const focusable = element.querySelector('button, input, textarea, [tabindex="0"]') as HTMLElement || element;
          focusable?.focus();
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-white flex flex-col max-h-[90vh] h-full shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            {mode === "create" ? (
              <><Plus className="w-5 h-5" /> Add New Lesson</>
            ) : (
              <><Edit2 className="w-5 h-5" /> Edit Lesson</>
            )}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1 !mb-0 font-medium">
            {mode === "create"
              ? "Create a new lesson for this chapter."
              : "Update the details and content of this lesson."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {!formReady ? (
              <div className="space-y-4 animate-pulse py-4">
                <div className="h-10 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg w-1/2" />
                <div className="h-32 bg-slate-100 rounded-lg" />
                <div className="h-24 bg-slate-100 rounded-lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Base Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-semibold text-slate-700">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lesson-title"
                      {...register("title")}
                      placeholder="e.g., Introduction to the course"
                      className="h-11"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div id="lesson-contentType" className="space-y-2">
                      <Label className="font-semibold text-slate-700">
                        Content Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={watch("contentType")}
                        onValueChange={(val) => setValue("contentType", val as any)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Chọn loại bài giảng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIDEO"><span className="flex items-center gap-2"><PlaySquare className="w-4 h-4" /> Video</span></SelectItem>
                          <SelectItem value="READING"><span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Reading</span></SelectItem>
                          <SelectItem value="QUIZ"><span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quiz</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(currentType === "VIDEO" || currentType === "QUIZ") && (
                      <div id="lesson-duration" className="space-y-2">
                        <Label htmlFor="duration" className="font-semibold text-slate-700">
                          Duration
                        </Label>
                        <Controller
                          control={control}
                          name="duration"
                          render={({ field }) => (
                            <DurationPicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {currentType === "VIDEO" && (
                    <div id="lesson-video-details" className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <PlaySquare className="w-4 h-4 text-blue-500" /> Lesson Video Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500 uppercase tracking-wider">Platform</Label>
                          <Select
                            value={watch("platform")}
                            onValueChange={(val) => setValue("platform", val as "YOUTUBE" | "CLOUDFLARE")}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Chọn nền tảng" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="YOUTUBE">YouTube</SelectItem>
                              <SelectItem value="CLOUDFLARE">Cloudeflare</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="videoId" className="text-xs text-slate-500 uppercase tracking-wider">Video URL</Label>
                          <Input
                            id="videoId"
                            {...register("videoId", {
                              onChange: (e) => {
                                const value = e.target.value
                                if (!value) return

                                // YouTube URL Extraction logic
                                try {
                                  if (value.includes("youtube.com") || value.includes("youtu.be")) {
                                    const url = new URL(value)
                                    let id = ""

                                    if (url.hostname.includes("youtube.com")) {
                                      if (url.pathname.includes("/watch")) {
                                        // Handles ?v=ID&params
                                        const vMatch = value.match(/[?&]v=([^#\s]+)/)
                                        if (vMatch) id = vMatch[1]
                                      } else if (url.pathname.includes("/embed/")) {
                                        // Handles /embed/ID?params
                                        id = url.pathname.replace("/embed/", "") + url.search
                                      }
                                    } else if (url.hostname.includes("youtu.be")) {
                                      // Handles youtu.be/ID?params
                                      id = url.pathname.slice(1) + url.search
                                    }

                                    if (id) {
                                      setValue("videoId", id)
                                    }
                                  }
                                } catch (err) {
                                  // Invalid URL, ignore
                                }
                              }
                            })}
                            placeholder=""
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentType === "READING" && (
                    <div id="lesson-reading-content" className="space-y-3">
                      <Label htmlFor="body" className="font-semibold text-slate-700">Reading Content</Label>
                      <Controller
                        control={control}
                        name="body"
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Start writing the lesson content here..."
                            className="h-[450px]"
                          />
                        )}
                      />
                    </div>
                  )}

                  {currentType === "QUIZ" && (
                    <div id="lesson-quiz-details" className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-green-500" /> Quiz Details
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs text-slate-500 uppercase tracking-wider">Description</Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Briefly describe what this quiz covers..."
                          className="resize-none bg-white min-h-[80px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="passPercent" className="text-xs text-slate-500 uppercase tracking-wider">Passing Score (%)</Label>
                          <Input
                            id="passPercent"
                            type="number"
                            {...register("passPercent")}
                            placeholder="80"
                            className="bg-white"
                          />
                        </div>
                      </div>

                      {/* Questions Section */}
                      <div className="pt-4 mt-6 border-t border-slate-200 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                            Câu hỏi & Đáp án
                          </h4>
                        </div>

                        <QuizQuestions control={control} register={register} errors={errors} watch={watch} setValue={setValue} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <Controller
                control={control}
                name="isPublish"
                render={({ field }) => (
                  <Switch
                    id="isPublish"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPublish" className="text-sm font-semibold cursor-pointer text-slate-700">
                Published
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-black/90 font-semibold px-6">
                {isSubmitting ? "Saving..." : mode === "create" ? "Add Lesson" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
