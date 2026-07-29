"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ExternalLink, Newspaper, FileText } from "lucide-react"
import type { News } from "@/lib/types"
import { NEWS_CATEGORIES } from "@/lib/types"

/* 날짜 포맷 */
function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}

/* ── 뉴스 뷰어 (전체화면 오버레이) ── */
function NewsViewer({
  news,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  news: News
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
    return () => {
      window.removeEventListener("popstate", onPop)
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const handleBack = () => window.history.back()
  const isHtmlContent = news.content ? news.content.trim().startsWith("<") : false

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={news.title}
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
          <p className="text-xs font-semibold text-primary">{news.category}</p>
          <p className="mt-0.5 truncate text-sm font-bold">{news.title}</p>
        </div>
        <div className="w-[60px] shrink-0" />
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto touch-pan-y"
        style={{ overscrollBehavior: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="mx-auto max-w-2xl px-5 py-8">
          {/* 메타 */}
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-bold leading-tight text-foreground">{news.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {news.author && <span>{news.author}</span>}
              {news.author && news.created_at && <span> · </span>}
              {news.created_at && <span>{formatDate(news.created_at)}</span>}
            </p>
          </div>

          {/* 썸네일 이미지 */}
          {news.image_url && (
            <figure className="mb-8 w-full overflow-hidden rounded-2xl bg-muted/30">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-auto object-cover"
                loading="eager"
                decoding="async"
              />
            </figure>
          )}

          {/* 본문 */}
          {news.content ? (
            isHtmlContent ? (
              <div
                className="prose prose-sm max-w-none leading-8 prose-content
                  prose-p:break-words prose-p:leading-8 prose-p:overflow-auto
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl
                  [&_img:not([style])]:w-full [&_img:not([style])]:block [&_img:not([style])]:my-6"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            ) : (
              <p className="whitespace-pre-line text-base leading-8 text-foreground">
                {news.content}
              </p>
            )
          ) : news.summary ? (
            <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">
              {news.summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">본문 내용이 없습니다.</p>
          )}

          {/* 외부 링크 */}
          {news.link_url && (
            <a
              href={news.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">원문 기사 보기</span>
            </a>
          )}

          <div className="mt-16" />
        </div>
      </div>

      {/* Prev / Next navigation */}
      {(hasPrev || hasNext) && (
        <div className="border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 flex gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-foreground disabled:opacity-30 hover:bg-muted transition-colors"
          >
            이전 글
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            다음 글
          </button>
        </div>
      )}
    </div>
  )
}

/* ── 뉴스 목록 + 카테고리 탭 ── */
export function NewsList({ newsList }: { newsList: News[] }) {
  const allCategories = ["전체", ...Array.from(new Set(newsList.map((n) => n.category).filter(Boolean)))]
  const [activeTab, setActiveTab] = useState<string>("전체")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filtered = activeTab === "전체"
    ? newsList
    : newsList.filter((n) => n.category === activeTab)

  const handleClose = () => setSelectedIndex(null)

  if (newsList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <Newspaper className="h-10 w-10 opacity-30" aria-hidden="true" />
        <p className="text-sm">아직 등록된 뉴스가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      {/* 카테고리 탭 */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto no-scrollbar overscroll-contain pb-1">
        {allCategories.map((cat) => {
          const active = activeTab === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveTab(cat); setSelectedIndex(null) }}
              className={`flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 카드 목록 */}
      <div className="flex flex-col gap-4 pb-8">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            해당 카테고리의 뉴스가 없습니다.
          </p>
        ) : (
          filtered.map((news, idx) => (
            <button
              key={news.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="group overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] active:translate-y-0 text-left w-full"
            >
              {/* 썸네일 */}
              {news.image_url ? (
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* 카테고리 뱃지 */}
                  <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                    {news.category}
                  </span>
                </div>
              ) : (
                <div className="flex h-20 w-full items-center justify-center bg-primary/8">
                  <FileText className="h-8 w-8 text-primary/40" aria-hidden="true" />
                </div>
              )}

              {/* 텍스트 영역 */}
              <div className="px-5 py-4">
                {!news.image_url && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {news.category}
                  </span>
                )}
                <h3 className="font-bold leading-snug text-foreground line-clamp-2">
                  {news.title}
                </h3>
                {news.summary && (
                  <p className="mt-1.5 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {news.summary}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  {news.author && <span className="font-medium">{news.author}</span>}
                  {news.author && <span>·</span>}
                  <span>{formatDate(news.created_at)}</span>
                  {news.link_url && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-primary">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        원문 링크
                      </span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 뷰어 */}
      {selectedIndex !== null && filtered[selectedIndex] && (
        <NewsViewer
          news={filtered[selectedIndex]}
          onClose={handleClose}
          hasNext={selectedIndex < filtered.length - 1}
          hasPrev={selectedIndex > 0}
          onNext={() => setSelectedIndex((i) => (i !== null ? i + 1 : null))}
          onPrev={() => setSelectedIndex((i) => (i !== null ? i - 1 : null))}
        />
      )}
    </>
  )
}
