import { Sparkles } from "lucide-react"
import { getApps } from "@/lib/db"
import { RecommendQuiz } from "@/components/recommend-quiz"
import { PageHeader } from "@/components/page-header"

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
        <div className="mb-5 rounded-2xl border border-border bg-card px-4 py-3 text-xs leading-5 text-muted-foreground">
          선택한 조건과 MFS 자체 평가 점수를 기기 안에서 가중 계산해 추천합니다. 설문 응답은 서버로 전송되지 않으며 금융 자문이 아닙니다.
        </div>
        <RecommendQuiz apps={apps} />
      </div>
    </div>
  )
}
