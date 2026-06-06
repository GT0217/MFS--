"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Lightbulb, Sparkles } from "lucide-react"

const TABS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/ranking", label: "랭킹", icon: Trophy },
  { href: "/insights", label: "인사이트", icon: Lightbulb },
  { href: "/recommend", label: "AI 추천", icon: Sparkles },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-border bg-card/95 backdrop-blur">
      <ul className="flex items-stretch justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
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
