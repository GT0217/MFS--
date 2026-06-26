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
  const [step, setStep] = useState(0)
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)

  function choose(weight: Weight) {
    setWeights((prev) => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(weight)) {
        next[k] = (next[k] ?? 0) + (v ?? 0)
      }
      return next
    })
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1)
    } else {
      setDone(true)
    }
  }

  function reset() {
    setStarted(false)
    setStep(0)
    setWeights({})
    setDone(false)
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card p-8 text-center shadow-md dark:bg-zinc-800">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-bold">나에게 맞는 금융앱 찾기</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          4개의 질문에 답하면 AI가 가장 잘 맞는 앱을 추천해드려요.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
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

  const question = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div>
      {/* Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            질문 {step + 1} / {QUESTIONS.length}
          </span>
          <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: i < step + 1 ? "100%" : i === step ? "50%" : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-balance text-lg font-bold leading-snug">{question.q}</h2>

      <ul className="mt-5 flex flex-col gap-3">
        {question.options.map((opt) => (
          <li key={opt.label}>
            <button
              type="button"
              onClick={() => choose(opt.weight)}
              className="flex w-full items-center justify-between rounded-3xl bg-card p-4 text-left text-sm font-semibold shadow-sm transition-colors active:bg-muted active:scale-[0.98] dark:bg-zinc-800"
            >
              {opt.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
