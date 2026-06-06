import type { Insight } from "@/lib/db"

export function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        아직 등록된 인사이트가 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2">
            {item.tag ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {item.tag}
              </span>
            ) : null}
            <time className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString("ko-KR")}
            </time>
          </div>
          <h3 className="mt-2 text-base font-semibold text-balance">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        </article>
      ))}
    </div>
  )
}
