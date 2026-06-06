"use client"

import { useState } from "react"
import { FileText, Megaphone } from "lucide-react"
import type { Insight } from "@/lib/types"
import { formatDate } from "@/lib/types"

const TABS = [
  { key: "칼럼", label: "MFS 칼럼" },
  { key: "대외활동", label: "대외활동" },
] as const

export function InsightTabs({ insights }: { insights: Insight[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("칼럼")
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
            <div className="flex gap-3 p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                {insight.image_url ? (
                  <img
                    src={insight.image_url || "/placeholder.svg"}
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
