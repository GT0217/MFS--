"use client"

"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Trophy, Lightbulb, Sparkles, Megaphone } from "lucide-react"

const TABS = [
  { href: "/", label: "홈", icon: Home, matchExact: true },
  { href: "/ranking", label: "랭킹", icon: Trophy, matchExact: false },
  { href: "/insights", label: "인사이트", icon: Lightbulb, matchExact: false, excludeTab: "대외활동" },
  { href: "/insights?tab=대외활동", label: "대외활동", icon: Megaphone, matchExact: false, requireTab: "대외활동" },
  { href: "/recommend", label: "AI 추천", icon: Sparkles, matchExact: false },
]

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab")

  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md bg-card/95 shadow-[0_-1px_0_0_rgba(0,0,0,0.08)] backdrop-blur">
      <ul className="flex items-stretch justify-around px-1 py-2">
        {TABS.map((tab) => {
          let active = false
          if (tab.matchExact) {
            active = pathname === tab.href
          } else if ("requireTab" in tab && tab.requireTab) {
            active = pathname.startsWith("/insights") && currentTab === tab.requireTab
          } else if ("excludeTab" in tab && tab.excludeTab) {
            active = pathname.startsWith("/insights") && currentTab !== tab.excludeTab
          } else {
            active = pathname.startsWith(tab.href)
          }

          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
