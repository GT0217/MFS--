"use client"

import { useState } from "react"
import useSWR from "swr"
import { ExternalLink, RefreshCw, Newspaper } from "lucide-react"
import type { ExternalNewsItem } from "@/app/api/news/external/route"

const TOPICS = [
  { label: "경제 전반", query: "경제" },
  { label: "은행", query: "은행" },
  { label: "핀테크", query: "핀테크" },
  { label: "증시", query: "증시" },
]

type ApiResponse = { items: ExternalNewsItem[] } | { error: string; message: string }

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function timeAgo(pubDate: string): string {
  const diffMs = Date.now() - new Date(pubDate).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "방금 전"
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(pubDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
}

export function ExternalNewsFeed() {
  const [topic, setTopic] = useState(TOPICS[0].query)
  const { data, isLoading, error, mutate, isValidating } = useSWR<ApiResponse>(
    `/api/news/external?query=${encodeURIComponent(topic)}&display=30`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const hasError = !!error || (data && "error" in data)
  const items = data && "items" in data ? data.items : []

  return (
    <div className="flex flex-col gap-4">
      {/* 주제 필터 — 가로 스크롤 칩 */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar">
        {TOPICS.map((t) => (
          <button
            key={t.query}
            type="button"
            onClick={() => setTopic(t.query)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              topic === t.query
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 상태: 로딩 */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        /* 상태: API 키 미설정 또는 오류 */
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">외부 뉴스를 불러올 수 없어요</p>
          <p className="text-xs leading-5 text-muted-foreground">
            네이버 뉴스 API 연동이 완료되면 다양한 언론사의 경제 뉴스를
            <br />
            실시간으로 모아볼 수 있습니다.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">관련 뉴스가 없습니다.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">네이버 뉴스 제공 · 실시간 업데이트</p>
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isValidating}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} aria-hidden="true" />
              새로고침
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {items.map((item, i) => (
              <li key={`${item.link}-${i}`}>
                <a
                  href={item.originallink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2">{item.title}</h3>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span>{timeAgo(item.pubDate)}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
