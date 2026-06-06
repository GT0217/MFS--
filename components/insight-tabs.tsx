"use client"

import { useState } from "react"
import { FileText, Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Insight } from "@/lib/types"
import { formatDate } from "@/lib/types"

const TABS = [
  { key: "칼럼", label: "MFS 칼럼" },
  { key: "대외활동", label: "대외활동" },
] as const

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
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs font-semibold text-primary">{insight.category || insight.type}</p>
          <p className="mt-0.5 text-sm font-bold line-clamp-1">{insight.title}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image - 웹툰처럼 풀 너비 */}
        {insight.image_url && (
          <div className="w-full bg-muted/50">
            <img
              src={insight.image_url}
              alt={insight.title}
              className="w-full h-auto object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="mx-auto max-w-2xl px-5 py-8">
          {/* 메타 정보 */}
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-bold leading-tight text-foreground">{insight.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {insight.author}
              {insight.published_on ? ` · ${formatDate(insight.published_on)}` : ""}
            </p>
          </div>

          {/* 본문 - 기사처럼 읽기 좋은 포맷 */}
          {insight.body ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-line text-base leading-8 text-foreground">
                {insight.body}
              </p>
            </div>
          ) : insight.summary ? (
            <p className="text-base leading-8 text-muted-foreground">{insight.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">본문 내용이 없습니다.</p>
          )}

          {/* 하단 여백 */}
          <div className="mt-16" />
        </div>
      </div>

      {/* 네비게이션 버튼 - 하단 고정 */}
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

export function InsightTabs({ insights }: { insights: Insight[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("칼럼")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const filtered = insights.filter((i) => i.type === tab)
  const selectedInsight = selectedIndex !== null ? filtered[selectedIndex] : null

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  return (
    <div>
      {/* 탭 버튼 */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key)
              setSelectedIndex(null)
            }}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 칼럼 리스트 - 썸네일 + 정보 */}
      <div className="mt-4 grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-border">
            아직 등록된 글이 없습니다.
          </div>
        ) : (
          filtered.map((insight, idx) => (
            <button
              key={insight.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="group overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-border/80 active:shadow-none"
            >
              <div className="flex gap-4 p-4">
                {/* 썸네일 */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-primary/10">
                  {insight.image_url ? (
                    <img
                      src={insight.image_url}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      crossOrigin="anonymous"
                    />
                  ) : insight.type === "칼럼" ? (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <FileText className="h-8 w-8" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <Megaphone className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="min-w-0 flex-1 text-left">
                  {insight.category && (
                    <span className="text-xs font-semibold text-primary">{insight.category}</span>
                  )}
                  <p className="mt-1 text-sm font-bold leading-snug line-clamp-2 text-foreground">
                    {insight.title}
                  </p>
                  {insight.summary && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
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
          ))
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
