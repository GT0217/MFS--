import type { Ranking } from "@/lib/db"

function medalClass(rank: number) {
  if (rank === 0) return "bg-primary text-primary-foreground"
  if (rank === 1) return "bg-emerald-100 text-emerald-700"
  if (rank === 2) return "bg-emerald-50 text-emerald-600"
  return "bg-muted text-muted-foreground"
}

export function RankingList({ rankings }: { rankings: Ranking[] }) {
  const maxScore = Math.max(...rankings.map((r) => r.score), 1)

  if (rankings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        아직 등록된 랭킹이 없습니다.
      </div>
    )
  }

  return (
    <ol className="flex flex-col gap-3">
      {rankings.map((r, i) => (
        <li
          key={r.id}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${medalClass(i)}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-base font-semibold">{r.name}</p>
                <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
                  {r.score}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(r.score / maxScore) * 100}%` }}
                />
              </div>
              {r.note ? (
                <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
