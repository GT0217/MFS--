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
  // 인라인 스타일 속성 허용
  "width", "style",
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 이미지 위에 표시되는 미니 정렬 툴바
 * float: left / 중앙(margin auto) / float: right 세 가지 지원
 */
function buildImageToolbar(img: HTMLImageElement, quill: any) {
  // 기존 툴바 제거
  document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())

  const toolbar = document.createElement("div")
  toolbar.className = "mfs-img-toolbar"
  toolbar.contentEditable = "false"

  const ALIGNS = [
    { label: "◀ 왼쪽", style: "float:left;margin:0 1rem 0.5rem 0;" },
    { label: "⬛ 중앙", style: "display:block;float:none;margin:0.75rem auto;" },
    { label: "오른쪽 ▶", style: "float:right;margin:0 0 0.5rem 1rem;" },
  ]

  // 너비 입력 필드
  const widthLabel = document.createElement("span")
  widthLabel.textContent = "너비:"
  widthLabel.style.cssText = "font-size:11px;color:#6b7280;align-self:center;"

  const widthInput = document.createElement("input")
  widthInput.type = "number"
  widthInput.min = "50"
  widthInput.max = "100"
  widthInput.value = img.style.width ? parseInt(img.style.width) + "" : "100"
  widthInput.title = "너비 (%)"
  widthInput.style.cssText =
    "width:52px;padding:2px 4px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;text-align:center;"

  const widthPct = document.createElement("span")
  widthPct.textContent = "%"
  widthPct.style.cssText = "font-size:11px;color:#6b7280;align-self:center;"

  widthInput.addEventListener("change", () => {
    const pct = Math.min(100, Math.max(10, Number(widthInput.value)))
    const current = img.getAttribute("style") || ""
    // 기존 width 관련 스타일 교체
    const cleaned = current.replace(/width\s*:\s*[^;]+;?/g, "").replace(/max-width\s*:\s*[^;]+;?/g, "").trim()
    img.setAttribute("style", `${cleaned}width:${pct}%;max-width:100%;`.replace(/;;/g, ";"))
    quill.update()
  })

  // 정렬 버튼
  ALIGNS.forEach(({ label, style }) => {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = label
    btn.title = label
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault()
      const current = img.getAttribute("style") || ""
      // float / display / margin 관련 기존 스타일 정리
      const cleaned = current
        .replace(/float\s*:\s*[^;]+;?/g, "")
        .replace(/display\s*:\s*[^;]+;?/g, "")
        .replace(/margin\s*:\s*[^;]+;?/g, "")
        .trim()
      img.setAttribute("style", `${cleaned};${style}`.replace(/^;/, ""))
      quill.update()
      // 활성 버튼 표시
      toolbar.querySelectorAll("button").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
    })
    toolbar.appendChild(btn)
  })

  toolbar.appendChild(widthLabel)
  toolbar.appendChild(widthInput)
  toolbar.appendChild(widthPct)

  // 이미지 바로 앞에 삽입
  img.parentNode?.insertBefore(toolbar, img)
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  /** 컨테이너 div에서 Quill 인스턴스를 꺼내는 헬퍼 */
  const getQuill = useCallback(() => {
    const el = containerRef.current?.querySelector(".ql-container") as any
    return el?.__quill ?? null
  }, [])

  // 에디터 마운트 후: 이미지 클릭 이벤트 위임 + ImageResize 모듈 등록
  useEffect(() => {
    // quill-image-resize-module-react는 window.Quill을 사용하므로
    // dynamic import 후 window.Quill에 등록
    let cleanup: (() => void) | undefined

    const timer = setTimeout(() => {
      const quill = getQuill()
      if (!quill) return

      const editor = quill.root as HTMLElement

      const handleImgClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === "IMG") {
          buildImageToolbar(target as HTMLImageElement, quill)
        } else if (!(target as HTMLElement).closest?.(".mfs-img-toolbar")) {
          document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
        }
      }

      editor.addEventListener("click", handleImgClick)
      document.addEventListener("click", (e) => {
        if (!(e.target as HTMLElement).closest?.(".ql-editor, .mfs-img-toolbar")) {
          document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
        }
      })

      cleanup = () => {
        editor.removeEventListener("click", handleImgClick)
        document.querySelectorAll(".mfs-img-toolbar").forEach((el) => el.remove())
      }
    }, 800)

    return () => {
      clearTimeout(timer)
      cleanup?.()
    }
  }, [getQuill])

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
