import { Sparkles } from "lucide-react"
import { getApps } from "@/lib/db"
import { RecommendQuiz } from "@/components/recommend-quiz"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function RecommendPage() {
  const apps = await getApps()

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        eyebrow="AI RECOMMEND"
        title="AI 추천"
        description="간단한 질문으로 나에게 맞는 금융앱을 찾아보세요"
      />
      <div className="px-5">
        <RecommendQuiz apps={apps} />
      </div>
    </div>
  )
}
