import { generateText } from "ai"
import { NextResponse } from "next/server"
import type { AppWithScore } from "@/lib/types"

export const runtime = "nodejs"

const MAX_APPS = 20
const MAX_ANSWER_LENGTH = 120

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const answers = Array.isArray(body.answers)
      ? body.answers.filter((answer: unknown): answer is string => typeof answer === "string").slice(0, 10)
      : []
    const apps = Array.isArray(body.apps) ? (body.apps.slice(0, MAX_APPS) as AppWithScore[]) : []

    if (!answers.length || !apps.length) {
      return NextResponse.json({ error: "추천에 필요한 정보가 부족합니다." }, { status: 400 })
    }

    const appSummary = apps.map((app) => ({
      name: app.name,
      tagline: app.tagline,
      overall: app.overall,
      strengths: {
        convenience: app.score_convenience,
        variety: app.score_variety,
        speed: app.score_speed,
        readability: app.score_readability,
        security: app.score_security,
      },
    }))

    const { text } = await generateText({
      model: "openai/gpt-oss-20b",
      temperature: 0.4,
      maxOutputTokens: 220,
      system: "당신은 MFS 금융앱 큐레이터입니다. 금융상품 가입이나 투자 결정을 권유하지 말고, 제공된 앱 평가 데이터 안에서만 한국어로 답하세요. 친절하지만 과장하지 말고, 추천 이유와 사용자가 확인할 점을 짧게 설명하세요.",
      prompt: `사용자의 설문 응답:
${answers.map((answer: string) => `- ${answer.slice(0, MAX_ANSWER_LENGTH)}`).join("\n")}

후보 금융앱 데이터(JSON):
${JSON.stringify(appSummary)}

가장 잘 맞는 앱 하나를 골라 2~3문장으로 설명하세요. 앱 이름을 정확히 포함하고, 마지막 문장은 "최종 선택 전에는 각 서비스의 수수료·약관·보안 정책을 직접 확인해 주세요."로 끝내세요.`,
    })

    return NextResponse.json({ explanation: text.trim() })
  } catch (error) {
    console.error("[MFS] AI recommendation failed", error)
    return NextResponse.json({ error: "AI 추천 설명을 생성하지 못했습니다." }, { status: 503 })
  }
}
