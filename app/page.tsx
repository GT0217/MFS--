import { getRankings, getInsights } from "@/lib/db"
import { SiteHeader } from "@/components/site-header"
import { RankingList } from "@/components/ranking-list"
import { InsightList } from "@/components/insight-list"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [rankings, insights] = await Promise.all([getRankings(), getInsights()])

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-balance">
                실시간 랭킹
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                종합 점수 기준 순위입니다.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {rankings.length}명
            </span>
          </div>
          <RankingList rankings={rankings} />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-balance">
              인사이트
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              주목할 만한 변화와 분석을 확인하세요.
            </p>
          </div>
          <InsightList insights={insights} />
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-5 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 서경 MFS
      </footer>
    </div>
  )
}
