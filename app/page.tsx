import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp, Sparkles, Users, Star, ChevronRight } from "lucide-react"
import { getApps, getInsights, getSiteSettings } from "@/lib/db"
import { formatDate } from "@/lib/types"
import { AppLogo } from "@/components/app-logo"

export const dynamic = "force-dynamic"

const MEDALS = ["#facc15", "#e2e8f0", "#d4a373"]

export default async function HomePage() {
  const [apps, insights, settings] = await Promise.all([getApps(), getInsights(), getSiteSettings()])
  const ranked = [...apps].sort((a, b) => b.overall - a.overall)
  const top3 = ranked.slice(0, 3)
  const latestColumns = insights.filter((i) => i.type === "칼럼").slice(0, 2)

  return (
    <div className="pb-4">
      {/* ── Hero ── */}
      <header className="relative min-h-[340px] overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src="/mfs-team.jpeg"
          alt=""
          fill
          priority
          sizes="448px"
          className="object-cover object-top"
          aria-hidden="true"
        />
        {/* 진한 오버레이 — 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/90" aria-hidden="true" />

        {/* 배지 */}
        <div className="relative px-6 pt-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#84cc16]" aria-hidden="true" />
            서경대학교 MFS 연구회
          </span>
        </div>

        {/* 메인 카피 */}
        <div className="relative px-6 pb-10 pt-5">
          <h1 className="text-balance text-[32px] font-bold leading-[1.2] tracking-tight text-white">
            {settings.hero_title.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-3 max-w-[18rem] text-pretty text-[15px] leading-relaxed text-white/80">
            {settings.hero_subtitle}
          </p>

          {/* CTA 버튼 — 토스 스타일 블루 */}
          <Link
            href="/ranking"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.97]"
          >
            랭킹 바로보기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Top 3 카드 ── */}
      <section className="px-5 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            이달의 Top 3
          </h2>
          <Link href="/ranking" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
            전체보기
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          {top3.map((app, idx) => (
            <Link
              key={app.id}
              href={`/ranking/${app.id}`}
              className="relative flex w-56 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-md transition-transform active:scale-[0.97]"
              style={{
                background: `linear-gradient(150deg, ${app.accent_color}dd, ${app.accent_color}88)`,
                minHeight: 188,
              }}
            >
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
              <div className="relative flex items-start justify-between">
                <span
                  className="flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-slate-800"
                  style={{ backgroundColor: MEDALS[idx] ?? "#ffffff" }}
                >
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {idx + 1}위
                </span>
                <AppLogo app={app} size={40} className="ring-2 ring-white/30" />
              </div>
              <div className="relative mt-4">
                <p className="text-lg font-bold">{app.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/75">{app.tagline}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-[26px] font-bold leading-none">{app.overall.toFixed(1)}</p>
                  <p className="text-xs text-white/70">/ 10</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI 추천 배너 ── */}
      <section className="px-5 pt-5">
        <Link
          href="/recommend"
          className="group flex items-center gap-4 overflow-hidden rounded-3xl bg-card p-5 shadow-md transition-transform active:scale-[0.98] dark:bg-zinc-800"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-bold">나에게 맞는 금융앱 찾기</p>
            <p className="mt-0.5 text-sm text-muted-foreground">AI가 1분 만에 추천해드려요</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-active:translate-x-1" aria-hidden="true" />
        </Link>
      </section>

      {/* ── 최신 인사이트 ── */}
      {latestColumns.length > 0 && (
        <section className="px-5 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">최신 인사이트</h2>
            <Link href="/insights" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
              전체보기
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {latestColumns.map((col) => (
              <Link
                key={col.id}
                href="/insights"
                className="block rounded-3xl bg-card p-5 shadow-sm transition-transform active:scale-[0.99] dark:bg-zinc-800"
              >
                {col.category && (
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {col.category}
                  </span>
                )}
                <p className="mt-2 text-pretty font-bold leading-snug">{col.title}</p>
                {col.summary && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{col.summary}</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {col.author}
                  {col.published_on ? ` · ${formatDate(col.published_on)}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 동아리 소개 ── */}
      <section className="px-5 pt-6">
        <div className="overflow-hidden rounded-3xl bg-card shadow-md dark:bg-zinc-800">
          <div className="p-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              MFS 연구회 · 서경대학교
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-tight">{settings.club_intro_title}</h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              {settings.club_intro_body}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { value: settings.member_count, label: "활동 멤버" },
                { value: String(apps.length), label: "평가 앱" },
                { value: "5", label: "평가 기준" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-muted py-3 dark:bg-zinc-700">
                  <p className="text-xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 랭킹 보러가기 CTA */}
            <Link
              href="/ranking"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
            >
              앱 랭킹 전체보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
