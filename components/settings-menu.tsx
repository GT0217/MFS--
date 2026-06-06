"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Settings, Moon, Sun, Type, ShieldCheck, Check } from "lucide-react"

type TextSize = "default" | "large"

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>("default")
  const containerRef = useRef<HTMLDivElement>(null)

  // Load persisted settings on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("mfs-theme")
    const storedSize = (localStorage.getItem("mfs-text-size") as TextSize) || "default"
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = storedTheme ? storedTheme === "dark" : prefersDark
    setDark(isDark)
    setTextSize(storedSize)
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.classList.toggle("text-large", storedSize === "large")
  }, [])

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("mfs-theme", next ? "dark" : "light")
  }

  function changeTextSize(size: TextSize) {
    setTextSize(size)
    document.documentElement.classList.toggle("text-large", size === "large")
    localStorage.setItem("mfs-text-size", size)
  }

  return (
    <div ref={containerRef} className="fixed right-[max(1rem,calc(50%-13rem))] top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="설정 열기"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground shadow-md ring-1 ring-border backdrop-blur transition-transform active:scale-95"
      >
        <Settings className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-90" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-card-foreground">설정</p>
            <p className="text-[11px] text-muted-foreground">화면을 보기 편하게 조절하세요</p>
          </div>

          {/* Dark mode toggle */}
          <button
            type="button"
            role="menuitem"
            onClick={toggleDark}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-card-foreground">
              {dark ? (
                <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
              다크 모드
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-border"}`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  dark ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          {/* Text size */}
          <div className="border-t border-border px-4 py-3">
            <span className="flex items-center gap-2.5 text-sm font-medium text-card-foreground">
              <Type className="h-4 w-4 text-primary" aria-hidden="true" />
              텍스트 크기
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <TextSizeButton active={textSize === "default"} onClick={() => changeTextSize("default")} label="기본" sizeClass="text-sm" />
              <TextSizeButton active={textSize === "large"} onClick={() => changeTextSize("large")} label="크게" sizeClass="text-base" />
            </div>
          </div>

          {/* Admin entry */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              관리자 시스템
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function TextSizeButton({
  active,
  onClick,
  label,
  sizeClass,
}: {
  active: boolean
  onClick: () => void
  label: string
  sizeClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-xl border py-2 font-semibold transition-colors ${sizeClass} ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      }`}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  )
}
