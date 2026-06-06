import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            MFS
          </span>
          <span className="text-base font-bold tracking-tight">서경 MFS</span>
        </Link>
        <Link
          href="/admin"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          관리자
        </Link>
      </div>
    </header>
  )
}
