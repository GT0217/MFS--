import type { LucideIcon } from "lucide-react"

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="relative overflow-hidden px-5 pb-6 pt-12">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          <h1 className="text-xl font-bold leading-tight">{title}</h1>
        </div>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  )
}
