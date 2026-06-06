"use client"

import { useState } from "react"
import { FileText, Megaphone, X, ChevronRight } from "lucide-react"
import type { Insight } from "@/lib/types"
import { formatDate } from "@/lib/types"

const TABS = [
  { key: "칼럼", label: "MFS 칼럼" },
  { key: "대외활동", label: "대외활동" },
] as const

function InsightModal({
  insight,
  onClose,
}: {
  insight: Insight
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={insight.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-t-[28px] bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex-1 pr-4">
            {insight.category && (
              <span className="text-xs font-semibold text-primary">{insight.category}</span>
            )}
            <p className="mt-0.5 text-balance font-bold leading-snug">{insight.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {insight.author}
              {insight.published_on ? ` · ${formatDate(insight.published_on)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {/* Image */}
        {insight.image_url && (
          <div className="h-44 w-full overflow-hidden">
            <img
              src={insight.image_url}
              alt=""
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}
        {/* Body */}
        <div className="max-h-[55dvh] overflow-y-auto px-5 py-4">
          {insight.body ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {insight.body}
            </p>
          ) : insight.summary ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{insight.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">본문 내용이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function InsightTabs({ insights }: { insights: Insight[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("칼럼")
  const [selected, setSelected] = useState<Insight | null>(null)
  const filtered = insights.filter((i) => i.type === tab)

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <li className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
            아직 등록된 글이 없습니다.
          </li>
        )}
        {filtered.map((insight) => (
          <li key={insight.id} className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
            <button
              type="button"
              className="flex w-full gap-3 p-4 text-left transition-colors active:bg-muted"
              onClick={() => setSelected(insight)}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                {insight.image_url ? (
                  <img
                    src={insight.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : insight.type === "칼럼" ? (
                  <FileText className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Megaphone className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                {insight.category && (
                  <span className="text-xs font-semibold text-primary">{insight.category}</span>
                )}
                <p className="mt-0.5 font-bold leading-snug">{insight.title}</p>
                {insight.summary && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{insight.summary}</p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {insight.author}
                  {insight.published_on ? ` · ${formatDate(insight.published_on)}` : ""}
                </p>
              </div>
              {(insight.body || insight.summary) && (
                <span className="flex shrink-0 items-center self-center text-muted-foreground">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <InsightModal insight={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
