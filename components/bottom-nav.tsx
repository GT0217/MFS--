"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Lightbulb, Newspaper, Sparkles } from "lucide-react"

const TABS = [
  { href: "/", label: "홈", icon: Home, exact: true },
  { href: "/ranking", label: "랭킹", icon: Trophy, exact: false },
  { href: "/insights", label: "인사이트", icon: Lightbulb, exact: false },
  { href: "/news", label: "뉴스", icon: Newspaper, exact: false },
  { href: "/recommend", label: "AI 추천", icon: Sparkles, exact: false },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-border/60 bg-card/80 backdrop-blur-md">
      <ul className="flex items-stretch justify-around px-1 py-1.5">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 ease-in-out ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                    active ? "bg-primary/12" : ""
                  }`}
                >
                  <Icon
                    className="h-5 w-5 transition-transform duration-200"
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                </span>
                <span className={`transition-all duration-200 ${active ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
