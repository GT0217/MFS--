import { Trophy } from "lucide-react"
import { getApps, getSiteSettings } from "@/lib/db"
import { RankingBoard } from "@/components/ranking-board"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function RankingPage() {
  const [apps, settings] = await Promise.all([getApps(), getSiteSettings()])

  return (
    <div>
      <PageHeader
        icon={Trophy}
        eyebrow="MFS RANKING"
        title="MFS 랭킹"
        description={`동아리원 ${settings.member_count}명이 한 달간 직접 사용해 평가했습니다`}
      />
      <div className="px-5">
        <RankingBoard apps={apps} />
      </div>
    </div>
  )
}
