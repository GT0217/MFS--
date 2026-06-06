import { getInsights } from "@/lib/db"
import { InsightTabs } from "@/components/insight-tabs"

export const dynamic = "force-dynamic"

export default async function InsightsPage() {
  const insights = await getInsights()

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold">인사이트</h1>
      <p className="mt-1 text-sm text-muted-foreground">동아리 칼럼과 대학생을 위한 금융 기회들</p>
      <div className="mt-6">
        <InsightTabs insights={insights} />
      </div>
    </div>
  )
}
