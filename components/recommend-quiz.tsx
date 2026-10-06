"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, RotateCcw, ChevronRight, Share2, Check } from "lucide-react"
import type { AppWithScore } from "@/lib/types"
import { AppLogo } from "@/components/app-logo"

type Weight = Partial<{
  convenience: number
  variety: number
  speed: number
  readability: number
  security: number
}>

type Question = {
  q: string
  options: { label: string; weight: Weight }[]
}

const QUESTIONS: Question[] = [
  {
    q: "금융앱에서 가장 중요한 건 무엇인가요?",
    options: [
      { label: "빠르고 간편한 송금", weight: { speed: 3, convenience: 2 } },
      { label: "다양한 금융 상품", weight: { variety: 3 } },
      { label: "안전한 보안", weight: { security: 3 } },
      { label: "보기 편한 화면", weight: { readability: 3 } },
    ],
  },
  {
    q: "앱을 주로 어떻게 사용하나요?",
    options: [
      { label: "매일 송금·결제", weight: { speed: 2, convenience: 2 } },
      { label: "저축·적금 관리", weight: { variety: 2, security: 1 } },
      { label: "자산 한눈에 보기", weight: { readability: 2, convenience: 1 } },
    ],
  },
  {
    q: "복잡한 메뉴는 어떤가요?",
    options: [
      { label: "단순한 게 좋아요", weight: { readability: 2, convenience: 2 } },
      { label: "기능 많은 게 좋아요", weight: { variety: 3 } },
    ],
  },
  {
    q: "금융 경험 수준은?",
    options: [
      { label: "이제 막 시작한 사회초년생", weight: { readability: 2, convenience: 2 } },
      { label: "어느 정도 익숙해요", weight: { variety: 1, speed: 1 } },
      { label: "다양하게 써본 편이에요", weight: { variety: 2, security: 1 } },
    ],
  },
]

const FIELD_MAP: Record<keyof Weight, keyof AppWithScore> = {
  convenience: "score_convenience",
  variety: "score_variety",
  speed: "score_speed",
  readability: "score_readability",
  security: "score_security",
}

const EXAMPLE_PROMPTS = [
  "신속한 게 좋아요",
  "보안성이 높은 게 좋아요",
  "자산을 한눈에 보고 싶어요",
  "처음 써도 쉬운 앱이면 좋겠어요",
]

const FOLLOW_UP_PROMPTS = [
  ["주로 송금과 결제를 해요", "투자 상품도 다양했으면 해요", "수수료가 낮은 게 중요해요"],
  ["화면이 한눈에 보이면 좋겠어요", "안전하게 관리하고 싶어요", "고객센터가 잘 되어 있으면 해요"],
]

function weightsFromMessage(message: string): Weight {
  const text = message.toLowerCase()
  const weight: Weight = {}
  const add = (key: keyof Weight, value: number) => { weight[key] = (weight[key] ?? 0) + value }
  if (/빠르|신속|송금|결제|속도/.test(text)) add("speed", 3)
  if (/편하|간편|쉬운|쉽게|단순|처음|초보/.test(text)) { add("convenience", 2); add("readability", 2) }
  if (/보안|안전|안심|신뢰/.test(text)) add("security", 3)
  if (/상품|기능|다양|투자|저축|적금/.test(text)) add("variety", 3)
  if (/한눈에|보기|화면|읽|자산 관리/.test(text)) add("readability", 3)
  return Object.keys(weight).length ? weight : { convenience: 2, readability: 1 }
}

function ShareButton({ appName, matchPct }: { appName: string; matchPct: number }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `MFS가 나에게 추천한 금융앱은 "${appName}"! 매칭도 ${matchPct}%\n서경대 MFS 연구회 앱 추천 받아보기: ${window.location.href}`
    if (navigator.share) {
      navigator.share({ title: "MFS AI 추천 결과", text }).catch(() => null)
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground transition-colors active:bg-muted"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          링크 복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          결과 공유하기
        </>
      )}
    </button>
  )
}

export function RecommendQuiz({ apps }: { apps: AppWithScore[] }) {
  const [started, setStarted] = useState(false)
  const [message, setMessage] = useState("")
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [answers, setAnswers] = useState<string[]>([])
  const [aiExplanation, setAiExplanation] = useState("")
  const [aiError, setAiError] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function requestAiExplanation(nextAnswers: string[]) {
    setAiLoading(true)
    setAiError("")
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: nextAnswers, apps }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || typeof data.explanation !== "string" || !data.explanation.trim()) {
        throw new Error(typeof data.error === "string" ? data.error : "AI 응답을 받을 수 없습니다.")
      }
      setAiExplanation(data.explanation.trim())
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI 추천 설명을 불러오지 못했습니다.")
    } finally {
      setAiLoading(false)
    }
  }

  function submitMessage(nextMessage = message) {
    const trimmed = nextMessage.trim()
    if (!trimmed) return
    const nextAnswers = [...answers, trimmed]
    setAnswers(nextAnswers)
    setMessage("")
    setWeights((current) => {
      const next = { ...current }
      for (const [key, value] of Object.entries(weightsFromMessage(trimmed))) {
        next[key] = (next[key] ?? 0) + value
      }
      return next
    })

    // 한 번의 답변으로 결론내리지 않고, 최소 세 가지 기준을 모은 뒤 분석합니다.
    if (nextAnswers.length >= 3) {
      setDone(true)
      void requestAiExplanation(nextAnswers)
    }
  }

  function reset() {
    setStarted(false)
    setMessage("")
    setWeights({})
    setAnswers([])
    setAiExplanation("")
    setAiError("")
    setAiLoading(false)
    setDone(false)
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card p-8 text-center shadow-md">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-bold leading-snug">나에게 맞는 금융앱 찾기</h2>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-8 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          시작하기
        </button>
      </div>
    )
  }

  if (done) {
    const scored = apps
      .map((app) => {
        let total = 0
        let weightSum = 0
        for (const [k, w] of Object.entries(weights)) {
          const field = FIELD_MAP[k as keyof Weight]
          total += Number(app[field]) * w
          weightSum += w
        }
        const match = weightSum > 0 ? total / weightSum : app.overall
        return { app, match }
      })
      .sort((a, b) => b.match - a.match)

    const best = scored[0]
    const runnerUps = scored.slice(1, 3)
    const matchPct = Math.round((best.match / 10) * 100)

    return (
      <div>
        <div
          className="rounded-3xl p-6 text-white shadow-lg"
          style={{ background: `linear-gradient(160deg, ${best.app.accent_color}, #0f9a42)` }}
        >
          <p className="text-xs font-semibold text-white/80">AI 추천 결과</p>
          <div className="mt-3 flex items-center gap-3">
            <AppLogo app={best.app} size={56} className="ring-2 ring-white/40" />
            <div>
              <p className="text-2xl font-bold">{best.app.name}</p>
              <p className="text-xs text-white/80">{best.app.tagline}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
              매칭도 {matchPct}%
            </span>
            <Link
              href={`/ranking/${best.app.id}`}
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-white"
            >
              자세히 보기
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-bold text-primary">MFS AI 분석</p>
          {aiLoading ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">답변과 앱 특징을 비교해 개인화된 분석을 작성하고 있어요...</p>
          ) : aiError ? (
            <div className="mt-2">
              <p className="text-sm leading-6 text-destructive">{aiError}</p>
              <button type="button" onClick={() => void requestAiExplanation(answers)} className="mt-3 rounded-lg bg-card px-3 py-2 text-xs font-bold text-foreground ring-1 ring-border">AI 분석 다시 시도</button>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">{aiExplanation}</p>
          )}
        </div>

        <h3 className="mt-6 text-sm font-bold text-muted-foreground">함께 추천하는 앱</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {runnerUps.map(({ app, match }) => (
            <li key={app.id}>
              <Link
                href={`/ranking/${app.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border"
              >
                <AppLogo app={app} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{app.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.tagline}</p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {Math.round((match / 10) * 100)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <ShareButton appName={best.app.name} matchPct={matchPct} />
          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-muted py-3.5 text-sm font-bold text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            다시 하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card p-5 shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold">어떤 금융앱을 찾고 있나요?</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">원하는 조건을 편하게 말해주시면 MFS AI가 앱을 비교해드릴게요.</p>
        </div>
      </div>

      {answers.length > 0 && (
        <div className="mt-5 flex flex-col gap-2" aria-label="내 답변">
          {answers.map((answer, index) => (
            <div key={`${answer}-${index}`} className="self-end rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              {answer}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">좋아요. {3 - answers.length}가지만 더 알려주시면 여러 조건을 함께 비교할게요.</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2" aria-label="예시 답변">
        {(answers.length === 0 ? EXAMPLE_PROMPTS : FOLLOW_UP_PROMPTS[Math.min(answers.length - 1, FOLLOW_UP_PROMPTS.length - 1)]).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setMessage((current) => current ? `${current}, ${prompt}` : prompt)}
            className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault()
          submitMessage()
        }}
      >
        <label htmlFor="recommendation-message" className="sr-only">원하는 금융앱 조건</label>
        <textarea
          id="recommendation-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="예: 매일 송금해서 빠르고 보안성 높은 앱이 좋아요"
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {answers.length === 0 ? "첫 번째 답변 보내기" : answers.length < 2 ? "다음 답변 보내기" : "AI에게 추천받기"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
