"use client"

import dynamic from "next/dynamic"
import { useRef, useMemo, useCallback, useEffect } from "react"

// Quill은 window에 의존하므로 SSR 비활성화
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote", "code-block",
  "link",
  "image",
  "width", "style",
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 이미지 선택 시 나타나는 정렬 미니툴바
 * DOM에 직접 삽입 — contentEditable="false"로 에디터 입력 차단
 */
function buildImageToolbar(img: HTMLImageElement, quill: any) {
  document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())

  const toolbar = document.createElement("div")
  toolbar.className = "mfs-img-toolbar"
  toolbar.contentEditable = "false"

  const ALIGNS = [
    { label: "◀ 왼쪽", style: "float:left;margin:0 1rem 0.5rem 0;" },
    { label: "■ 중앙",  style: "display:block;float:none;margin:0.75rem auto;" },
    { label: "오른쪽 ▶", style: "float:right;margin:0 0 0.5rem 1rem;" },
  ]

  ALIGNS.forEach(({ label, style }) => {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = label
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault()
      const cur = img.getAttribute("style") || ""
      const cleaned = cur
        .replace(/float\s*:\s*[^;]+;?/g, "")
        .replace(/display\s*:\s*[^;]+;?/g, "")
        .replace(/margin\s*:\s*[^;]+;?/g, "")
        .trim()
        .replace(/;$/, "")
      img.setAttribute("style", [cleaned, style].filter(Boolean).join(";"))
      quill.update()
      toolbar.querySelectorAll("button").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
    })
    toolbar.appendChild(btn)
  })

  img.parentNode?.insertBefore(toolbar, img)
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRegistered = useRef(false)

  const getQuill = useCallback(() => {
    const el = containerRef.current?.querySelector(".ql-container") as any
    return el?.__quill ?? null
  }, [])

  // ImageResize 모듈을 window.Quill에 등록 (클라이언트 전용, 한 번만)
  useEffect(() => {
    if (resizeRegistered.current) return

    const timer = setTimeout(async () => {
      const quill = getQuill()
      if (!quill) return

      try {
        // Quill 전역 인스턴스 확인
        const Q = (window as any).Quill
        if (!Q) return

        if (!Q.__resizeRegistered) {
          const { default: ImageResize } = await import("quill-image-resize-module-react")
          Q.register("modules/imageResize", ImageResize)
          Q.__resizeRegistered = true
        }

        resizeRegistered.current = true
      } catch {
        // 이미 등록된 경우 무시
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [getQuill])

  // 이미지 클릭 → 정렬 툴바 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      const quill = getQuill()
      if (!quill) return

      const editor = quill.root as HTMLElement

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === "IMG") {
          buildImageToolbar(target as HTMLImageElement, quill)
        } else if (!target.closest(".mfs-img-toolbar")) {
          document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
        }
      }

      const handleOutsideClick = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest?.(".ql-editor, .mfs-img-toolbar")) {
          document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
        }
      }

      editor.addEventListener("click", handleClick)
      document.addEventListener("click", handleOutsideClick)

      return () => {
        editor.removeEventListener("click", handleClick)
        document.removeEventListener("click", handleOutsideClick)
        document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [getQuill])

  // 이미지 커스텀 핸들러: 파일 선택 → /api/upload-image → Quill에 URL 삽입
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
      const placeholder_text = "이미지 업로드 중..."
      quill.insertText(range.index, placeholder_text, "color", "#9ca3af")

      try {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload-image", { method: "POST", body: fd })
        const data = await res.json()
        if (!data.url) throw new Error("No URL")

        quill.deleteText(range.index, placeholder_text.length)
        quill.insertEmbed(range.index, "image", data.url)
        // 기본 너비 설정: 삽입 직후 img 태그에 width 적용
        setTimeout(() => {
          const imgs = quill.root.querySelectorAll(`img[src="${data.url}"]`)
          const lastImg = imgs[imgs.length - 1] as HTMLImageElement | undefined
          if (lastImg && !lastImg.style.width) {
            lastImg.setAttribute("style", "width:100%;max-width:100%;display:block;margin:0.75rem auto;")
          }
        }, 100)
        quill.setSelection(range.index + 1, 0)
      } catch {
        quill.deleteText(range.index, placeholder_text.length)
        alert("이미지 업로드에 실패했습니다.")
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
      handlers: { image: imageHandler },
    },
    imageResize: {
      // 리사이즈 모듈 옵션 — modules/imageResize 등록 후 적용됨
      parchment: (window as any)?.Quill?.import?.("parchment"),
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
