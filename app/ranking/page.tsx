import { getApps } from "@/lib/db"
import { RankingBoard } from "@/components/ranking-board"

export const dynamic = "force-dynamic"

export default async function RankingPage() {
  const apps = await getApps()
  const raterCount = apps[0]?.rater_count ?? 0

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold">MFS 랭킹</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        동아리원 {raterCount}명이 한 달간 직접 사용해 평가했습니다
      </p>
      <div className="mt-6">
        <RankingBoard apps={apps} />
      </div>
    </div>
  )
}
