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

    const appSummary = apps
      .map((app) => ({
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
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 3)

    const { text } = await generateText({
      model: "openai/gpt-oss-20b",
      temperature: 0.4,
      maxOutputTokens: 220,
      system: "당신은 MFS의 개인화 금융앱 큐레이터입니다. 사용자의 설문 답변과 제공된 앱 평가 데이터만 근거로 한국어 분석을 작성하세요. 금융상품 가입이나 투자 결정을 권유하지 말고, 앱 선택을 돕는 비교 정보만 제공하세요. 같은 표현을 반복하지 말고 답변에 등장한 구체적인 선호와 앱의 점수를 연결하세요.",
      prompt: `사용자의 실제 설문 답변:
${answers.map((answer: string, index: number) => `${index + 1}. ${answer.slice(0, MAX_ANSWER_LENGTH)}`).join("\n")}

상위 후보 금융앱 데이터(JSON):
${JSON.stringify(appSummary)}

다음 형식을 정확히 지켜 3개 항목으로 작성하세요. 각 항목은 한 문장씩, 총 4~6문장으로 작성합니다.
1. "추천 이유: [사용자의 답변을 구체적으로 언급하고, 추천 앱의 점수/특징과 연결]"
2. "잘 맞는 부분: [이 앱이 특히 해결해 줄 사용자의 우선순위]"
3. "확인할 점: [이 앱을 선택하기 전에 확인할 구체적인 제한이나 조건]"
앱 이름은 정확히 포함하세요. 빈 문장, 일반적인 칭찬, "설문 결과를 바탕으로 정리했습니다" 같은 표현은 사용하지 마세요. 마지막 문장은 "최종 선택 전에는 각 서비스의 수수료·약관·보안 정책을 직접 확인해 주세요."로 끝내세요.`,
    })

    return NextResponse.json({ explanation: text.trim() })
  } catch (error) {
    console.error("[MFS] AI recommendation failed", error)
    return NextResponse.json({ error: "AI 추천 설명을 생성하지 못했습니다." }, { status: 503 })
  }
}
