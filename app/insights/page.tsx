import { Lightbulb } from "lucide-react"
import { getInsights } from "@/lib/db"
import { InsightTabs } from "@/components/insight-tabs"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [insights, params] = await Promise.all([getInsights(), searchParams])
  const initialTab = params.tab

  return (
    <div>
      <PageHeader
        icon={Lightbulb}
        eyebrow="INSIGHTS"
        title={initialTab === "대외활동" ? "대외활동" : "인사이트"}
        description={
          initialTab === "대외활동"
            ? "동아리 대외활동 및 공모전 참여 기록"
            : "동아리 분석 칼럼과 카드뉴스 소재"
        }
      />
      <div className="px-5">
        <InsightTabs insights={insights} initialTab={initialTab} />
      </div>
    </div>
  )
}
