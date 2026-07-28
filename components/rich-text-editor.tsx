"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

// Quill은 window에 의존하므로 SSR 비활성화
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote"],
    ["clean"],
  ],
}

const FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote",
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => MODULES, [])
  return (
    <div className="rounded-lg border border-border text-sm">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder ?? "내용을 입력하세요..."}
      />
    </div>
  )
}
