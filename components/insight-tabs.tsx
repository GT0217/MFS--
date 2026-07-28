"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, ChevronLeft, ChevronRight, Download } from "lucide-react"
import type { Insight, InsightCategoryRow } from "@/lib/types"
import { formatDate, INSIGHT_CATEGORIES } from "@/lib/types"

// 폴백용 하드코딩 탭
const FALLBACK_TABS = INSIGHT_CATEGORIES.map((c) => ({ key: c.value, label: c.label }))

type TabKey = string

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("application/pdf")
}

function InsightViewer({
  insight,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  insight: Insight
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  hasNext: boolean
  hasPrev: boolean
}) {
  useEffect(() => {
    window.history.pushState({ mfsViewer: true }, "")
    const onPop = () => onClose()
    window.addEventListener("popstate", onPop)
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") window.history.back() }
    document.addEventListener("keydown", onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("popstate", onPop)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const handleBack = () => window.history.back()

  const allImages: string[] = [
    ...(insight.image_url ? [insight.image_url] : []),
    ...(Array.isArray(insight.image_urls) ? insight.image_urls : []),
  ].filter(Boolean)

  const isHtmlBody = insight.body ? insight.body.trim().startsWith("<") : false

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={insight.title}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="목록으로 뒤로가기"
          className="flex items-center gap-1 rounded-full py-1 pl-1 pr-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          뒤로
        </button>
        <div className="min-w-0 flex-1 px-2 text-center">
          <p className="text-xs font-semibold text-primary">{insight.category || insight.type}</p>
          <p className="mt-0.5 truncate text-sm font-bold">{insight.title}</p>
        </div>
        <div className="w-[60px] shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-8">
          {/* 메타 정보 */}
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-bold leading-tight text-foreground">{insight.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {insight.author}
              {insight.published_on ? ` · ${formatDate(insight.published_on)}` : ""}
            </p>
          </div>

          {/* 다중 이미지 — 기사 스타일 세로 배치 */}
          {allImages.filter((u) => !isPdf(u)).length > 0 && (
            <div className="mb-8 flex flex-col gap-6">
              {allImages.filter((u) => !isPdf(u)).map((url, i) => (
                <figure key={i} className="w-full overflow-hidden rounded-2xl bg-muted/30">
                  <img
                    src={url}
                    alt={`${insight.title} 이미지 ${i + 1}`}
                    className="w-full h-auto object-cover"
                    crossOrigin="anonymous"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ imageRendering: "auto" }}
                  />
                </figure>
              ))}
            </div>
          )}

          {/* PDF 다운로드 버튼 */}
          {allImages.filter((u) => isPdf(u)).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
            >
              <Download className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">PDF 보기 · {url.split("/").pop()}</span>
            </a>
          ))}

          {/* 본문 — HTML이면 prose로, 일반 텍스트면 whitespace-pre-line */}
          {insight.body ? (
            isHtmlBody ? (
              <div
                className="prose prose-sm max-w-none leading-8 prose-content
                  prose-p:break-words prose-p:leading-8 prose-p:overflow-auto
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl
                  [&_img:not([style])]:w-full [&_img:not([style])]:block [&_img:not([style])]:my-6
                  [&::after]:table [&::after]:content-[''] [&::after]:clear-both"
                dangerouslySetInnerHTML={{ __html: insight.body }}
              />
            ) : (
              <p className="whitespace-pre-line text-base leading-8 text-foreground">
                {insight.body}
              </p>
            )
          ) : insight.summary ? (
            <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">{insight.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">본문 내용이 없습니다.</p>
          )}

          <div className="mt-16" />
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-card/95 backdrop-blur-sm px-4 py-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="이전 글"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="text-xs text-muted-foreground">
          {insight.author} · {insight.published_on ? formatDate(insight.published_on) : ""}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="다음 글"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function InsightTabs({
  insights,
  categories,
  initialTab,
}: {
  insights: Insight[]
  categories?: InsightCategoryRow[]
  initialTab?: string
}) {
  // DB 카테고리 → 탭 배열, 없으면 폴백
  const tabs = (categories && categories.length > 0)
    ? categories.map((c) => ({ key: c.name, label: c.name }))
    : FALLBACK_TABS

  const validInitial = tabs.find((t) => t.key === initialTab)?.key ?? tabs[0]?.key ?? ""
  const [tab, setTab] = useState<TabKey>(validInitial)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // 탭 스크롤 화살표
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect() }
  }, [checkScroll, tabs])

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" })
  }

  // 탭 변경 시 해당 버튼이 보이도록 스크롤
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const btn = el.querySelector<HTMLButtonElement>(`[data-tab="${tab}"]`)
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
  }, [tab])

  const filtered = insights.filter((i) => i.category === tab)
  const selectedInsight = selectedIndex !== null ? filtered[selectedIndex] : null

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) setSelectedIndex(selectedIndex + 1)
  }
  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1)
  }

  return (
    <div>
      {/* 탭 바 — 좌우 화살표 + 스크롤 */}
      <div className="relative flex items-center gap-1">
        {/* 왼쪽 화살표 */}
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label="이전 탭"
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:bg-muted ${
            canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronLeft className="h-4 w-4 text-foreground" aria-hidden="true" />
        </button>

        {/* 탭 스크롤 영역 */}
        <div
          ref={scrollRef}
          className="flex flex-1 gap-1.5 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                data-tab={t.key}
                type="button"
                onClick={() => { setTab(t.key); setSelectedIndex(null) }}
                className={`flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* 오른쪽 화살표 */}
        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label="다음 탭"
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:bg-muted ${
            canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronRight className="h-4 w-4 text-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* 리스트 */}
      <div className="mt-4 grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            아직 등록된 글이 없습니다.
          </div>
        ) : (
          filtered.map((insight, idx) => {
            const thumb = insight.image_url || (insight.image_urls ?? [])[0]
            return (
              <button
                key={insight.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="group overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] active:shadow-none active:translate-y-0 text-left"
              >
                <div className="flex gap-4 p-4">
                  {/* 썸네일 */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-primary/10">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        crossOrigin="anonymous"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <FileText className="h-8 w-8" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="min-w-0 flex-1">
                    {insight.category && (
                      <span className="text-xs font-semibold text-primary">{insight.category}</span>
                    )}
                    <p className="mt-1 text-sm font-bold leading-snug line-clamp-2 text-foreground">
                      {insight.title}
                    </p>
                    {insight.summary && (
                      <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground leading-relaxed">
                        {insight.summary}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      {insight.author}
                      {insight.published_on ? ` · ${formatDate(insight.published_on)}` : ""}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* 풀스크린 뷰어 */}
      {selectedInsight && selectedIndex !== null && (
        <InsightViewer
          insight={selectedInsight}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={selectedIndex < filtered.length - 1}
          hasPrev={selectedIndex > 0}
        />
      )}
    </div>
  )
}
