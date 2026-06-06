import { getApps } from "@/lib/db"
import { RecommendQuiz } from "@/components/recommend-quiz"

export const dynamic = "force-dynamic"

export default async function RecommendPage() {
  const apps = await getApps()

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold">AI 추천</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        간단한 질문으로 나에게 맞는 금융앱을 찾아보세요
      </p>
      <div className="mt-6">
        <RecommendQuiz apps={apps} />
      </div>
    </div>
  )
}
