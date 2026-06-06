import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
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
    <div>
      {/* Header */}
      <header
        className="px-5 pb-7 pt-12 text-white"
        style={{ background: `linear-gradient(160deg, ${app.accent_color}, #1d4ed8)` }}
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
      </header>

      {/* Stat card */}
      <section className="-mt-4 px-5">
        <div className="grid grid-cols-3 rounded-2xl bg-card py-4 shadow-sm ring-1 ring-border">
          <Stat label="종합" value={app.overall.toFixed(1)} highlight />
          <Stat label="평가자" value={String(app.rater_count)} divider />
          <Stat label="기준" value={String(app.criteria_count)} />
        </div>
      </section>

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
