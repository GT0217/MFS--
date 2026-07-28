"use client"

/**
 * RichTextEditor — Quill + quill-image-resize-module-react
 *
 * 핵심 원칙:
 *  - ImageResize 모듈은 Quill 클래스에 등록돼야 하므로,
 *    ReactQuill 컴포넌트가 마운트되기 **전에** Quill.register() 완료가 필요.
 *  - dynamic() 의 async loader 안에서 두 패키지를 순서대로 import 해
 *    등록까지 완료한 뒤 래퍼 컴포넌트를 반환하는 방식이 유일하게 안정적.
 *  - modules 객체는 컴포넌트 외부에서 한 번만 생성(참조 불변) — 
 *    매 렌더마다 새 객체가 생기면 Quill이 툴바를 재생성하며 핸들러를 잃음.
 */

import dynamic from "next/dynamic"
import { useRef, useCallback } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/* ────────────────────────────────────────────────────────── */
/*  이미지 업로드 핸들러 — Quill 인스턴스를 인자로 받음        */
/* ────────────────────────────────────────────────────────── */
async function uploadAndInsert(quill: any) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif"
  input.click()

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const range = quill.getSelection(true)
    const PLACEHOLDER = "이미지 업로드 중..."
    quill.insertText(range.index, PLACEHOLDER, { color: "#9ca3af", italic: true })

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload-image", { method: "POST", body: fd })
      const data = await res.json()
      if (!data.url) throw new Error("no url")

      quill.deleteText(range.index, PLACEHOLDER.length)
      quill.insertEmbed(range.index, "image", data.url)
      quill.setSelection(range.index + 1, 0)
    } catch {
      quill.deleteText(range.index, PLACEHOLDER.length)
      alert("이미지 업로드에 실패했습니다.")
    }
  }
}

/* ────────────────────────────────────────────────────────── */
/*  dynamic() — Quill 로드 → ImageResize 등록 → 컴포넌트 반환 */
/* ────────────────────────────────────────────────────────── */
const QuillWithResize = dynamic(
  async () => {
    // 1) react-quill-new 로드 (내부적으로 quill v2 번들)
    const { default: ReactQuill, Quill } = await import("react-quill-new")

    // 2) quill-image-resize-module-react 를 동일 Quill 클래스에 등록
    //    true = 기존 등록 덮어쓰기 허용 (HMR 재등록 에러 방지)
    try {
      const { default: ImageResize } = await import("quill-image-resize-module-react")
      Quill.register("modules/imageResize", ImageResize, true)
    } catch {
      // 등록 실패해도 에디터는 동작 (리사이즈만 비활성)
    }

    // 3) modules 를 이 스코프에서 한 번만 생성 — imageHandler 도 여기서 클로저
    const modules = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote"],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image() {
            // this 컨텍스트: Quill toolbar 인스턴스 → this.quill 로 인스턴스 접근
            uploadAndInsert((this as any).quill)
          },
        },
      },
      imageResize: {
        // Resize: 드래그 핸들, DisplaySize: 크기 표시 라벨, Toolbar: 정렬 버튼
        modules: ["Resize", "DisplaySize", "Toolbar"],
        handleStyles: {
          backgroundColor: "#5ba832",
          border: "2px solid white",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
        },
        displayStyles: {
          backgroundColor: "#5ba832",
          color: "#fff",
          fontSize: "11px",
          borderRadius: "4px",
          padding: "2px 6px",
        },
      },
    }

    const formats = [
      "header",
      "bold", "italic", "underline", "strike",
      "list",
      "blockquote",
      "link",
      "image",
    ]

    // 4) 실제 렌더 컴포넌트 반환
    function Editor({
      value,
      onChange,
      placeholder,
    }: {
      value: string
      onChange: (v: string) => void
      placeholder?: string
    }) {
      return (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder ?? "내용을 입력하세요..."}
        />
      )
    }

    return Editor
  },
  { ssr: false },
)

/* ────────────────────────────────────────────────────────── */
/*  공개 컴포넌트                                              */
/* ────────────────────────────────────────────────────────── */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rounded-lg border border-border text-sm overflow-hidden">
      <QuillWithResize value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
