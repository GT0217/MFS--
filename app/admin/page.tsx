import Link from "next/link"
import { isAuthenticated, isAdminConfigured } from "@/lib/auth"
import { getApps, getInsights, getSiteSettings } from "@/lib/db"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAuthenticated()
  const configured = isAdminConfigured()

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <h1 className="text-base font-bold tracking-tight">MFS Club · 관리자</h1>
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            사이트로 이동
          </Link>
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
              {configured ? (
                <LoginForm />
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  ADMIN_ID와 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. 프로젝트
                  설정에서 추가해 주세요.
                </p>
              )}
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
