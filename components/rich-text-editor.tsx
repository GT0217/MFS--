"use client"

import dynamic from "next/dynamic"
import { useRef, useMemo, useCallback } from "react"

// Quill은 window에 의존하므로 SSR 비활성화
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote", "code-block",
  "link",
  "image",
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // Quill 에디터 컨테이너 ref — 핸들러에서 Quill 인스턴스에 접근하기 위해 사용
  const containerRef = useRef<HTMLDivElement>(null)

  /** 컨테이너 div에서 Quill 인스턴스를 꺼내는 헬퍼 */
  const getQuill = useCallback(() => {
    const el = containerRef.current?.querySelector(".ql-editor")?.closest(".ql-container") as any
    return el?.__quill ?? (window as any).Quill?.find?.(el) ?? null
  }, [])

  // 이미지 커스텀 핸들러: 파일 선택 → 서버 업로드 → Quill에 URL 삽입
  const imageHandler = useCallback(() => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/jpeg,image/jpg,image/png,image/webp,image/gif")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const quill = getQuill()
      if (!quill) return

      const range = quill.getSelection(true)
      quill.insertText(range.index, "이미지 업로드 중...", "color", "#888")

      try {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload-image", { method: "POST", body: fd })
        const data = await res.json()
        if (!data.url) throw new Error("No URL returned")

        quill.deleteText(range.index, "이미지 업로드 중...".length)
        quill.insertEmbed(range.index, "image", data.url)
        quill.setSelection(range.index + 1, 0)
      } catch {
        quill.deleteText(range.index, "이미지 업로드 중...".length)
        alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.")
      }
    }
  }, [getQuill])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler])

  return (
    <div ref={containerRef} className="rounded-lg border border-border text-sm">
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
