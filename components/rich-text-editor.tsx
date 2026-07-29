"use client"

/**
 * RichTextEditor — Quill + 순수 React 이미지 리사이즈 구현
 * 마우스(PC) + 터치(모바일) 핀치줌·드래그 핸들 완전 지원
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

/* ── 핀치 거리 계산 ── */
function getTouchDist(touches: TouchList): number {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

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

/* ── 이미지 리사이즈 핸들 컴포넌트 (마우스 + 터치 완전 지원) ── */
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
  // 마우스 드래그 상태
  const mouseDragRef = useRef<{ x: number; w: number; corner: string } | null>(null)
  // 터치 단일 핸들 드래그 상태
  const touchDragRef = useRef<{ x: number; w: number; corner: string } | null>(null)
  // 핀치줌 상태
  const pinchRef = useRef<{ dist: number; w: number } | null>(null)

  const corners = [
    { key: "nw", top: -10, left: -10, cursor: "nw-resize" },
    { key: "ne", top: -10, left: pos.width - 10, cursor: "ne-resize" },
    { key: "sw", top: pos.height - 10, left: -10, cursor: "sw-resize" },
    { key: "se", top: pos.height - 10, left: pos.width - 10, cursor: "se-resize" },
  ]

  /* ── 마우스 핸들러 ── */
  const onMouseDown = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.preventDefault()
      e.stopPropagation()
      mouseDragRef.current = { x: e.clientX, w: pos.width, corner }

      const onMove = (ev: MouseEvent) => {
        if (!mouseDragRef.current) return
        const dx = ev.clientX - mouseDragRef.current.x
        const mult = corner.endsWith("e") ? 1 : -1
        onResize(Math.max(40, Math.round(mouseDragRef.current.w + dx * mult)))
      }
      const onUp = () => {
        mouseDragRef.current = null
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    },
    [pos.width, onResize],
  )

  /* ── 터치 핸들러: 핸들 위 단일 손가락 드래그 ── */
  const onHandleTouchStart = useCallback(
    (e: React.TouchEvent, corner: string) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.touches.length === 1) {
        touchDragRef.current = { x: e.touches[0].clientX, w: pos.width, corner }
      }
    },
    [pos.width],
  )

  /* ── 터치 핸들러: 이미지 영역 핀치줌 ── */
  const onImgAreaTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        pinchRef.current = { dist: getTouchDist(e.touches as unknown as TouchList), w: pos.width }
      }
    },
    [pos.width],
  )

  /* ── window 레벨 touchmove / touchend ── */
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      // 핀치줌 (두 손가락)
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const newDist = getTouchDist(e.touches)
        const scale = newDist / pinchRef.current.dist
        onResize(Math.max(40, Math.round(pinchRef.current.w * scale)))
        return
      }
      // 핸들 단일 드래그 (한 손가락)
      if (e.touches.length === 1 && touchDragRef.current) {
        e.preventDefault()
        const dx = e.touches[0].clientX - touchDragRef.current.x
        const mult = touchDragRef.current.corner.endsWith("e") ? 1 : -1
        onResize(Math.max(40, Math.round(touchDragRef.current.w + dx * mult)))
      }
    }
    const onTouchEnd = () => {
      touchDragRef.current = null
      pinchRef.current = null
    }
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd)
    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [onResize])

  return (
    <>
      {/* 이미지 선택 테두리 + 핀치줌 터치 영역 */}
      <div
        onTouchStart={onImgAreaTouchStart}
        style={{
          position: "absolute",
          top: pos.top,
          left: pos.left,
          width: pos.width,
          height: pos.height,
          border: "2px solid #5ba832",
          borderRadius: 4,
          boxSizing: "border-box",
          zIndex: 10,
          touchAction: "none",
        }}
      />

      {/* 정렬 미니 툴바 */}
      <div
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: pos.top - 44,
          left: pos.left,
          zIndex: 20,
          display: "flex",
          gap: 4,
          background: "#1f2937",
          padding: "5px 8px",
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
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
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onAlign(style) }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#e5e7eb",
              background: "transparent",
              border: "1px solid #374151",
              borderRadius: 5,
              // 모바일에서 탭하기 충분한 최소 크기
              padding: "6px 10px",
              minHeight: 36,
              cursor: "pointer",
              whiteSpace: "nowrap",
              touchAction: "manipulation",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 네 모서리 핸들 — 모바일 터치 타겟 충분히 크게 (20x20) */}
      {corners.map(({ key, top, left, cursor }) => (
        <div
          key={key}
          onMouseDown={(e) => onMouseDown(e, key)}
          onTouchStart={(e) => onHandleTouchStart(e, key)}
          style={{
            position: "absolute",
            top: pos.top + top,
            left: pos.left + left,
            width: 20,
            height: 20,
            background: "#5ba832",
            border: "2px solid #fff",
            borderRadius: "50%",
            cursor,
            zIndex: 20,
            boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            touchAction: "none",
          }}
        />
      ))}

      {/* 외부 클릭/터치 감지용 투명 오버레이 */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9 }}
        onMouseDown={onDeselect}
        onTouchEnd={(e) => { e.preventDefault(); onDeselect() }}
      />
    </>
  )
}

/* ── 메인 에디터 컴포넌트 ── */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [handlePos, setHandlePos] = useState<HandlePos | null>(null)

  const { modules, formats } = getModulesAndFormats()

  /* 이미지 클릭/터치 → 핸들 위치 계산 */
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

  /* .ql-editor 내 이미지 — mousedown + touchend 이벤트 위임 */
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" && wrapper.contains(target)) {
        e.stopPropagation()
        selectImage(target as HTMLImageElement)
      }
    }
    // 터치: touchend로 처리해야 이미지 선택이 확실히 됨
    const onTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" && wrapper.contains(target)) {
        e.preventDefault()
        selectImage(target as HTMLImageElement)
      }
    }

    wrapper.addEventListener("mousedown", onMouseDown)
    wrapper.addEventListener("touchend", onTouchEnd, { passive: false })
    return () => {
      wrapper.removeEventListener("mousedown", onMouseDown)
      wrapper.removeEventListener("touchend", onTouchEnd)
    }
  }, [selectImage])

  /* 이미지 크기 변경 → Quill HTML 동기화 */
  const syncQuill = useCallback(
    (img: HTMLImageElement) => {
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
    [onChange, selectImage],
  )

  const handleResize = useCallback(
    (newWidth: number) => {
      if (!handlePos) return
      const img = handlePos.imgEl
      const currentStyle = img.getAttribute("style") || ""
      const withoutWidth = currentStyle.replace(/width\s*:[^;]+;?/gi, "").trim()
      img.setAttribute("style", `${withoutWidth ? withoutWidth + ";" : ""}width:${newWidth}px;`)
      syncQuill(img)
    },
    [handlePos, syncQuill],
  )

  const handleAlign = useCallback(
    (alignStyle: string) => {
      if (!handlePos) return
      const img = handlePos.imgEl
      const currentStyle = img.getAttribute("style") || ""
      const widthMatch = currentStyle.match(/width\s*:[^;]+;?/i)
      const widthStr = widthMatch ? widthMatch[0].replace(/;$/, "") : ""
      const combined = [widthStr, alignStyle].filter(Boolean).join(";")
      img.setAttribute("style", combined)
      syncQuill(img)
    },
    [handlePos, syncQuill],
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
