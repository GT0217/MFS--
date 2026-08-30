import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export type ExternalNewsItem = {
  title: string
  link: string
  originallink: string
  description: string
  pubDate: string
  source: string
}

// 제목/요약에 섞인 <b> 강조 태그와 HTML 엔티티를 제거해 순수 텍스트로 정리
function stripHtml(input: string): string {
  return input
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .trim()
}

// 기사 원문 링크의 호스트명에서 언론사 이름을 유추 (네이버 API가 언론사명을 별도로 주지 않음)
function guessSource(originallink: string): string {
  try {
    const host = new URL(originallink).hostname.replace(/^www\./, "")
    return host
  } catch {
    return "언론사 미확인"
  }
}

export async function GET(request: Request) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "missing_credentials", message: "네이버 뉴스 API 키가 설정되지 않았습니다." },
      { status: 200 },
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || "경제"
  const display = Math.min(Number(searchParams.get("display")) || 30, 100)

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`,
      {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
        // 5분 캐시 — 과도한 API 호출 방지
        next: { revalidate: 300 },
      },
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_error", message: "네이버 뉴스를 불러오지 못했습니다." },
        { status: 200 },
      )
    }

    const data = await res.json()
    const items: ExternalNewsItem[] = (data.items ?? []).map((item: any) => ({
      title: stripHtml(item.title),
      link: item.link,
      originallink: item.originallink || item.link,
      description: stripHtml(item.description),
      pubDate: item.pubDate,
      source: guessSource(item.originallink || item.link),
    }))

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: "network_error", message: "네이버 뉴스를 불러오지 못했습니다." },
      { status: 200 },
    )
  }
}
