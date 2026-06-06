import Link from "next/link"
import { isAuthenticated, isAdminConfigured } from "@/lib/auth"
import { getApps, getInsights, getSiteSettings } from "@/lib/db"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { LogoutButton } from "@/components/logout-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPage() {
  const authed = await isAuthenticated()

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <h1 className="text-base font-bold tracking-tight">MFS Club · 관리자</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              사이트로 이동
            </Link>
            {authed && <LogoutButton />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        {authed ? (
          <AuthedView />
        ) : (
          <div className="mx-auto max-w-sm">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-1 text-xl font-bold">관리자 로그인</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                앱 정보, 점수, 사진, 인사이트를 관리하려면 로그인하세요.
              </p>
              <LoginForm />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

async function AuthedView() {
  const [apps, insights, siteSettings] = await Promise.all([getApps(), getInsights(), getSiteSettings()])
  return <AdminDashboard apps={apps} insights={insights} siteSettings={siteSettings} />
}
