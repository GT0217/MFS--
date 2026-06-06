import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ExternalLink, Users } from "lucide-react"
import { getApp, CRITERIA } from "@/lib/db"
import { AppLogo } from "@/components/app-logo"
import { ScoreRadar } from "@/components/score-radar"

export const dynamic = "force-dynamic"

export default async function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const app = await getApp(Number(id))
  if (!app) notFound()

  const detailCriteria = CRITERIA.filter((c) => c.field !== "overall")

  return (
    <div className="pb-8">
      {/* Header */}
      <header
        className="px-5 pb-8 pt-12 text-white"
        style={{ background: `linear-gradient(160deg, ${app.accent_color}, #0f9a42)` }}
      >
        <Link href="/ranking" className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          랭킹
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <AppLogo app={app} size={56} className="ring-2 ring-white/40" />
          <div>
            <p className="text-xs font-medium text-white/80">{app.category}</p>
            <p className="text-2xl font-bold">{app.name}</p>
          </div>
        </div>
        {app.tagline && <p className="mt-3 text-sm text-white/90">{app.tagline}</p>}
        {app.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {/* App store link */}
        {app.app_store_url && (
          <a
            href={app.app_store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            앱 다운로드
          </a>
        )}
      </header>

      {/* Stat card */}
      <section className="-mt-4 px-5">
        <div className="grid grid-cols-3 rounded-2xl bg-card py-4 shadow-sm ring-1 ring-border">
          <Stat label="종합점수" value={app.overall.toFixed(1)} highlight />
          <Stat label="평가자" value={`${app.rater_count}명`} divider />
          <Stat label="평가 기준" value={`${app.criteria_count}가지`} />
        </div>
      </section>

      {/* Rater badge */}
      {app.rater_count > 0 && (
        <section className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2.5 ring-1 ring-primary/15">
            <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-primary">{app.rater_count}명</span>의 MFS 동아리원이 직접 사용하고 평가했습니다.
            </p>
          </div>
        </section>
      )}

      {/* Radar */}
      <section className="px-5 pt-6">
        <h2 className="text-base font-bold">상세 점수</h2>
        <div className="mt-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
          <ScoreRadar app={app} />
          <ul className="mt-2 grid grid-cols-2 gap-2 px-2 pb-2">
            {detailCriteria.map((c) => (
              <li key={c.key} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-sm font-bold text-primary">
                  {Number(app[c.field as keyof typeof app]).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Description */}
      {app.description && (
        <section className="px-5 pt-6">
          <h2 className="text-base font-bold">앱 소개</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {app.description}
          </p>
        </section>
      )}

      {/* Club comment */}
      {app.club_comment && (
        <section className="px-5 pt-6">
          <h2 className="text-base font-bold">MFS 동아리 한줄평</h2>
          <div className="mt-2 rounded-2xl bg-primary/5 p-4 text-sm leading-relaxed text-foreground ring-1 ring-primary/15">
            {app.club_comment}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
  divider,
}: {
  label: string
  value: string
  highlight?: boolean
  divider?: boolean
}) {
  return (
    <div className={`flex flex-col items-center ${divider ? "border-x border-border" : ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`mt-1 text-xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
