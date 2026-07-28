import { Lightbulb } from "lucide-react"
import { getInsights, getInsightCategories } from "@/lib/db"
import { InsightTabs } from "@/components/insight-tabs"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [insights, categories, params] = await Promise.all([
    getInsights(),
    getInsightCategories(),
    searchParams,
  ])
  const initialTab = params.tab

  return (
    <div>
      <PageHeader
        icon={Lightbulb}
        eyebrow="INSIGHTS"
        title="인사이트"
        description="동아리 분석 칼럼과 카드뉴스 소재"
      />
      <div className="px-5">
        <InsightTabs insights={insights} categories={categories} initialTab={initialTab} />
      </div>
    </div>
  )
}
