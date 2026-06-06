import Link from "next/link"
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import { getApps, getInsights } from "@/lib/db"
import { AppLogo } from "@/components/app-logo"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [apps, insights] = await Promise.all([getApps(), getInsights()])
  const ranked = [...apps].sort((a, b) => b.overall - a.overall)
  const top3 = ranked.slice(0, 3)
  const latestColumn = insights.find((i) => i.type === "칼럼") ?? insights[0]

  return (
    <div>
      {/* Hero */}
      <header className="bg-gradient-to-b from-[#0f9a42] to-[#14bb51] px-5 pb-8 pt-12 text-white">
        <p className="text-xs font-semibold tracking-wide text-white/80">MFS CLUB · 2025.06</p>
        <h1 className="mt-2 text-balance text-2xl font-bold leading-snug">
          대학생이 직접 써본
          <br />
          모바일 금융앱은 어땠을까?
        </h1>
      </header>

      {/* Top 3 */}
      <section className="-mt-4 rounded-t-3xl bg-background px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-bold">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            이달의 MFS 랭킹 Top 3
          </h2>
          <Link href="/ranking" className="text-xs font-medium text-muted-foreground">
            전체보기
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {top3.map((app, idx) => (
            <Link
              key={app.id}
              href={`/ranking/${app.id}`}
              className="relative flex w-64 shrink-0 snap-start flex-col justify-between rounded-3xl p-5 text-white shadow-lg"
              style={{
                background: `linear-gradient(150deg, ${app.accent_color}, #0f9a42)`,
                minHeight: 190,
              }}
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">#{idx + 1}</span>
                <AppLogo app={app} size={40} className="ring-2 ring-white/40" />
              </div>
              <div className="mt-4">
                <p className="text-xl font-bold">{app.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-white/80">{app.tagline}</p>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/70">종합점수</p>
                  <p className="text-2xl font-bold">{app.overall.toFixed(1)}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-white/80" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="px-5 pt-6">
        <Link
          href="/recommend"
          className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">나에게 맞는 은행 찾기</span>
            <span className="block text-xs text-muted-foreground">AI가 1분만에 추천해드려요</span>
          </span>
          <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </Link>
      </section>

      {/* Latest column */}
      {latestColumn && (
        <section className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">최신 인사이트</h2>
            <Link href="/insights" className="text-xs font-medium text-muted-foreground">
              전체보기
            </Link>
          </div>
          <Link
            href="/insights"
            className="mt-3 block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border"
          >
            <span className="text-xs font-semibold text-primary">{latestColumn.category}</span>
            <p className="mt-1 font-bold leading-snug">{latestColumn.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{latestColumn.summary}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {latestColumn.author}
              {latestColumn.published_on ? ` · ${latestColumn.published_on}` : ""}
            </p>
          </Link>
        </section>
      )}
    </div>
  )
}
