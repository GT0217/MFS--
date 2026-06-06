import { Lightbulb } from "lucide-react"
import { getInsights } from "@/lib/db"
import { InsightTabs } from "@/components/insight-tabs"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function InsightsPage() {
  const insights = await getInsights()

  return (
    <div>
      <PageHeader
        icon={Lightbulb}
        eyebrow="INSIGHTS"
        title="인사이트"
        description="동아리 칼럼과 대학생을 위한 금융 기회들"
      />
      <div className="px-5">
        <InsightTabs insights={insights} />
      </div>
    </div>
  )
}
