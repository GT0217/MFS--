import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp, Sparkles, Users, Star } from "lucide-react"
import { getApps, getInsights, getSiteSettings } from "@/lib/db"
import { formatDate } from "@/lib/types"
import { AppLogo } from "@/components/app-logo"

export const dynamic = "force-dynamic"

const MEDALS = ["#facc15", "#cbd5e1", "#d4a373"]

export default async function HomePage() {
  const [apps, insights, settings] = await Promise.all([getApps(), getInsights(), getSiteSettings()])
  const ranked = [...apps].sort((a, b) => b.overall - a.overall)
  const top3 = ranked.slice(0, 3)
  const latestColumns = insights.filter((i) => i.type === "칼럼").slice(0, 2)

  return (
    <div className="pb-2">
      {/* Hero */}
      <header
        className="relative overflow-hidden px-5 pb-12 pt-14 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%)" }}
      >
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bef264]" aria-hidden="true" />
            서경대학교 MFS 연구회
          </span>
          <h1 className="mt-4 text-balance text-[26px] font-bold leading-[1.3]">
            {settings.hero_title.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-3 max-w-[16rem] text-pretty text-sm leading-relaxed text-white/85">
            {settings.hero_subtitle}
          </p>
        </div>
      </header>

      {/* Top 3 */}
      <section className="-mt-6 rounded-t-[28px] bg-background px-5 pt-7">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-bold">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            이달의 MFS 랭킹 Top 3
          </h2>
          <Link href="/ranking" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
            전체보기
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {top3.map((app, idx) => (
            <Link
              key={app.id}
              href={`/ranking/${app.id}`}
              className="relative flex w-60 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[24px] p-5 text-white shadow-lg transition-transform active:scale-[0.98]"
              style={{
                background: `linear-gradient(150deg, ${app.accent_color}, var(--color-hero-from))`,
                minHeight: 196,
              }}
            >
              <div
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between">
                <span
                  className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-slate-900"
                  style={{ backgroundColor: MEDALS[idx] ?? "#ffffff" }}
                >
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  {idx + 1}위
                </span>
                <AppLogo app={app} size={42} className="ring-2 ring-white/40" />
              </div>
              <div className="relative mt-4">
                <p className="text-xl font-bold">{app.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-white/80">{app.tagline}</p>
              </div>
              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-white/70">종합점수</p>
                  <p className="text-[28px] font-bold leading-none">{app.overall.toFixed(1)}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="px-5 pt-6">
        <Link
          href="/recommend"
          className="group relative flex items-center gap-3 overflow-hidden rounded-[20px] p-4 text-white shadow-sm transition-transform active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, var(--color-hero-from), var(--color-hero-to))" }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">나에게 맞는 금융앱 찾기</span>
            <span className="block text-xs text-white/80">AI가 1분 만에 추천해드려요</span>
          </span>
          <ArrowRight className="h-5 w-5 transition-transform group-active:translate-x-1" aria-hidden="true" />
        </Link>
      </section>

      {/* Latest insights */}
      {latestColumns.length > 0 && (
        <section className="px-5 pt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">최신 인사이트</h2>
            <Link href="/insights" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
              전체보기
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {latestColumns.map((col) => (
              <Link
                key={col.id}
                href="/insights"
                className="block rounded-[20px] bg-card p-4 shadow-sm ring-1 ring-border transition-transform active:scale-[0.99]"
              >
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {col.category}
                </span>
                <p className="mt-2 text-pretty font-bold leading-snug">{col.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{col.summary}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {col.author}
                  {col.published_on ? ` · ${formatDate(col.published_on)}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Club intro */}
      <section className="px-5 pt-7">
        <div className="overflow-hidden rounded-[24px] bg-card shadow-sm ring-1 ring-border">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/mfs-team.jpeg"
              alt="서경대학교 MFS 연구회 멤버들이 단체 배너를 들고 찍은 단체 사진"
              fill
              priority
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/85">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                MFS 연구회 · with 서기수 교수님
              </p>
              <p className="text-pretty text-sm font-bold leading-snug">
                직접 쓰고, 토론하고, 점수를 매깁니다
              </p>
            </div>
          </div>
          <div className="p-5">
            <h2 className="text-base font-bold">{settings.club_intro_title}</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {settings.club_intro_body}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted py-3">
                <p className="text-lg font-bold text-primary">{settings.member_count}</p>
                <p className="text-[11px] text-muted-foreground">활동 멤버</p>
              </div>
              <div className="rounded-xl bg-muted py-3">
                <p className="text-lg font-bold text-primary">{apps.length}</p>
                <p className="text-[11px] text-muted-foreground">평가 앱</p>
              </div>
              <div className="rounded-xl bg-muted py-3">
                <p className="text-lg font-bold text-primary">5</p>
                <p className="text-[11px] text-muted-foreground">평가 기준</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
