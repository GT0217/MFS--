"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { CRITERIA, type AppWithScore, type Criterion } from "@/lib/types"
import { AppLogo } from "@/components/app-logo"

function scoreFor(app: AppWithScore, c: Criterion): number {
  if (c.field === "overall") return app.overall
  return Number(app[c.field as keyof AppWithScore])
}

export function RankingBoard({ apps }: { apps: AppWithScore[] }) {
  const [active, setActive] = useState<Criterion>(CRITERIA[0])

  const sorted = [...apps].sort((a, b) => scoreFor(b, active) - scoreFor(a, active))

  return (
    <div>
      {/* Criteria filter */}
      <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
        {CRITERIA.map((c) => {
          const isActive = c.key === active.key
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground shadow-sm dark:bg-zinc-800"
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {sorted.map((app, idx) => {
          const rank = idx + 1
          const score = scoreFor(app, active)
          return (
            <li key={app.id}>
              <Link
                href={`/ranking/${app.id}`}
                className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm transition-transform active:scale-[0.98] dark:bg-zinc-800"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    rank <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground dark:bg-zinc-700"
                  }`}
                >
                  {rank}
                </span>
                <AppLogo app={app} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{app.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">{active.label}</p>
                  <p className="text-xl font-bold text-primary">{score.toFixed(1)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
