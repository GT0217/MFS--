"use client"

/**
 * RichTextEditor — Quill + 순수 React 이미지 리사이즈 구현
 *
 * quill-image-resize-module-react는 Quill v2(parchment) 호환 문제로 제거.
 * 대신 MutationObserver로 .ql-editor 내 이미지를 감시하고,
 * React 포털 없이 wrapper div에 절대좌표 핸들을 직접 렌더링.
 */

import dynamic from "next/dynamic"
import { useRef, useState, useEffect, useCallback } from "react"

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/* ── 이미지 업로드 핸들러 ── */
async function uploadAndInsert(quill: any) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif"
  input.click()
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const range = quill.getSelection(true)
    const PLACEHOLDER = "업로드 중..."
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

/* ── ReactQuill dynamic import (SSR 비활성) ── */
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new")
    return RQ
  },
  { ssr: false },
)

/* ── 리사이즈 핸들 위치 타입 ── */
interface HandlePos {
  top: number
  left: number
  width: number
  height: number
  imgEl: HTMLImageElement
}

/* ── modules는 컴포넌트 외부에서 한 번만 생성 (참조 불변) ── */
let _modules: any = null
let _formats: string[] | null = null

function getModulesAndFormats() {
  if (_modules) return { modules: _modules, formats: _formats! }
  _modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image"],
        ["clean"],
      ],
      handlers: {
        image() {
          uploadAndInsert((this as any).quill)
        },
      },
    },
  }
  _formats = [
    "header", "bold", "italic", "underline", "strike",
    "color", "background",
    "list", "blockquote", "link", "image",
  ]
  return { modules: _modules, formats: _formats }
}

/* ── 이미지 리사이즈 핸들 컴포넌트 ── */
function ResizeHandles({
  pos,
  onResize,
  onAlign,
  onDeselect,
}: {
  pos: HandlePos
  onResize: (newWidth: number) => void
  onAlign: (style: string) => void
  onDeselect: () => void
}) {
  const startRef = useRef<{ x: number; w: number; corner: string } | null>(null)

  const corners = [
    { key: "nw", style: { top: -6, left: -6, cursor: "nw-resize" } },
    { key: "ne", style: { top: -6, left: pos.width - 6, cursor: "ne-resize" } },
    { key: "sw", style: { top: pos.height - 6, left: -6, cursor: "sw-resize" } },
    { key: "se", style: { top: pos.height - 6, left: pos.width - 6, cursor: "se-resize" } },
  ]

  const onMouseDown = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.preventDefault()
      e.stopPropagation()
      startRef.current = { x: e.clientX, w: pos.width, corner }

      const onMove = (ev: MouseEvent) => {
        if (!startRef.current) return
        const dx = ev.clientX - startRef.current.x
        const mult = corner.endsWith("e") ? 1 : -1
        const newW = Math.max(40, startRef.current.w + dx * mult)
        onResize(Math.round(newW))
      }
      const onUp = () => {
        startRef.current = null
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    },
    [pos.width, onResize],
  )

  return (
    <>
      {/* 오버레이 박스 */}
      <div
        style={{
          position: "absolute",
          top: pos.top,
          left: pos.left,
          width: pos.width,
          height: pos.height,
          border: "2px solid #5ba832",
          borderRadius: 4,
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {/* 정렬 미니 툴바 */}
      <div
        style={{
          position: "absolute",
          top: pos.top - 34,
          left: pos.left,
          zIndex: 20,
          display: "flex",
          gap: 4,
          background: "#1f2937",
          padding: "3px 6px",
          borderRadius: 7,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {[
          { label: "◀ 왼쪽", style: "float:left;margin:0 12px 8px 0;" },
          { label: "▣ 중앙", style: "display:block;margin:8px auto;" },
          { label: "오른쪽 ▶", style: "float:right;margin:0 0 8px 12px;" },
        ].map(({ label, style }) => (
          <button
            key={label}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onAlign(style) }}
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#e5e7eb",
              background: "transparent",
              border: "1px solid #374151",
              borderRadius: 5,
              padding: "2px 7px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* 네 모서리 핸들 */}
      {corners.map(({ key, style }) => (
        <div
          key={key}
          onMouseDown={(e) => onMouseDown(e, key)}
          style={{
            position: "absolute",
            top: pos.top + (style.top as number),
            left: pos.left + (style.left as number),
            width: 12,
            height: 12,
            background: "#5ba832",
            border: "2px solid #fff",
            borderRadius: "50%",
            cursor: style.cursor as string,
            zIndex: 20,
            boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
      ))}
      {/* 외부 클릭 감지용 투명 오버레이 */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9 }}
        onMouseDown={onDeselect}
      />
    </>
  )
}

/* ── 메인 에디터 컴포넌트 ── */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [handlePos, setHandlePos] = useState<HandlePos | null>(null)

  const { modules, formats } = getModulesAndFormats()

  /* 이미지 클릭 → 핸들 위치 계산 */
  const selectImage = useCallback((img: HTMLImageElement) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const wRect = wrapper.getBoundingClientRect()
    const iRect = img.getBoundingClientRect()
    setHandlePos({
      top: iRect.top - wRect.top + wrapper.scrollTop,
      left: iRect.left - wRect.left,
      width: iRect.width,
      height: iRect.height,
      imgEl: img,
    })
  }, [])

  /* .ql-editor 내 이미지 클릭 이벤트 위임 */
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" && wrapper.contains(target)) {
        e.stopPropagation()
        selectImage(target as HTMLImageElement)
      }
    }
    wrapper.addEventListener("mousedown", handler)
    return () => wrapper.removeEventListener("mousedown", handler)
  }, [selectImage])

  /* 이미지 크기 변경 */
  const handleResize = useCallback(
    (newWidth: number) => {
      if (!handlePos) return
      const img = handlePos.imgEl
      const currentStyle = img.getAttribute("style") || ""
      // float/margin 유지하면서 width만 교체
      const withoutWidth = currentStyle.replace(/width\s*:[^;]+;?/gi, "").trim()
      img.setAttribute("style", `${withoutWidth ? withoutWidth + ";" : ""}width:${newWidth}px;`)
      // Quill HTML 강제 동기화
      const editor = img.closest(".ql-editor") as HTMLElement | null
      if (editor) {
        // quill-new exposes __quill on the container
        const container = editor.parentElement
        const quillInstance = (container as any)?.__quill
        if (quillInstance) {
          quillInstance.update()
          onChange(quillInstance.root.innerHTML)
        }
      }
      selectImage(img)
    },
    [handlePos, onChange, selectImage],
  )

  /* 정렬 스타일 변경 */
  const handleAlign = useCallback(
    (alignStyle: string) => {
      if (!handlePos) return
      const img = handlePos.imgEl
      const currentStyle = img.getAttribute("style") || ""
      // float/display/margin 제거 후 새 정렬 적용, width는 유지
      const widthMatch = currentStyle.match(/width\s*:[^;]+;?/i)
      const widthStr = widthMatch ? widthMatch[0].replace(/;$/, "") : ""
      const combined = [widthStr, alignStyle].filter(Boolean).join(";")
      img.setAttribute("style", combined)
      const editor = img.closest(".ql-editor") as HTMLElement | null
      if (editor) {
        const container = editor.parentElement
        const quillInstance = (container as any)?.__quill
        if (quillInstance) {
          quillInstance.update()
          onChange(quillInstance.root.innerHTML)
        }
      }
      selectImage(img)
    },
    [handlePos, onChange, selectImage],
  )

  return (
    <div
      ref={wrapperRef}
      className="rounded-lg border border-border overflow-visible text-sm"
      style={{ position: "relative" }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder ?? "내용을 입력하세요..."}
      />
      {handlePos && (
        <ResizeHandles
          pos={handlePos}
          onResize={handleResize}
          onAlign={handleAlign}
          onDeselect={() => setHandlePos(null)}
        />
      )}
    </div>
  )
}
