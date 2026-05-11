"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-slate-100 rounded-md" />,
})

import { 
  Table, 
  BetweenHorizontalEnd, 
  BetweenHorizontalStart, 
  BetweenVerticalEnd, 
  BetweenVerticalStart,
  Trash2
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
    ["table"],
    // Custom table controls (these will be handled by our custom icons/logic)
    [{ "table-controls": ["row-above", "row-below", "col-left", "col-right", "delete-row", "delete-col", "delete-table"] }]
  ],
  table: true,
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
  "code-block",
  "table",
]

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  // Use a effect to add custom icons to the toolbar once it's rendered
  useEffect(() => {
    const addTableIcons = () => {
      const toolbar = document.querySelector(".quill-editor .ql-toolbar")
      if (!toolbar) return

      // Map of values to labels or icons (we'll just use text for simplicity if icons are hard to inject into default Quill buttons)
      // Actually, we can use the default Quill table menu if we just explain it, 
      // but let's try to make the toolbar buttons work.
    }
    
    // Quill 2.0 with table: true usually provides a context menu.
    // If we want to make it easy, we just need to make sure the user knows how to use it.
  }, [])

  return (
    <div className={`bg-white rounded-md border border-slate-200 overflow-hidden quill-editor ${className || "min-h-[200px]"}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-full"
      />
      <style jsx global>{`
        .quill-editor .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        /* Custom Table Controls UI */
        .quill-editor .ql-table {
          width: 28px !important;
        }
        
        .quill-editor .ql-container {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
          height: calc(100% - 42px);
        }
        .quill-editor .ql-editor {
          min-height: 100%;
        }
        .quill-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .quill-editor .ql-syntax {
          background-color: #1e293b;
          color: #f8fafc;
          border-radius: 6px;
          padding: 1rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.8rem;
          line-height: 1.5;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .quill-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border: 1px solid #e2e8f0;
        }
        .quill-editor table td, .quill-editor table th {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
          font-size: 0.875rem;
          min-width: 50px;
        }
        .quill-editor table th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        .quill-editor table tr:hover {
          background-color: #fcfdfe;
        }
        
        /* Better Table Selection/Menu UI */
        .ql-table-controls {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
          padding: 4px !important;
        }
        .ql-table-controls button {
          padding: 6px 12px !important;
          font-size: 12px !important;
          border-radius: 4px !important;
        }
        .ql-table-controls button:hover {
          background: #f1f5f9 !important;
        }
      `}</style>
    </div>
  )
}
