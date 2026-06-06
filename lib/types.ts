export type App = {
  id: number
  name: string
  category: string
  tagline: string | null
  description: string | null
  logo_url: string | null
  accent_color: string
  tags: string[]
  club_comment: string | null
  app_store_url: string | null
  rater_count: number
  criteria_count: number
  score_convenience: number
  score_variety: number
  score_speed: number
  score_readability: number
  score_security: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type AppWithScore = App & { overall: number }

export type Insight = {
  id: number
  type: string
  category: string | null
  title: string
  summary: string | null
  body: string | null
  author: string | null
  image_url: string | null
  published_on: string | null
  sort_order: number
  created_at: string
}

export const SCORE_FIELDS = [
  "score_convenience",
  "score_variety",
  "score_speed",
  "score_readability",
  "score_security",
] as const

export function overallScore(app: App): number {
  const sum = SCORE_FIELDS.reduce((acc, f) => acc + Number(app[f]), 0)
  return Math.round((sum / SCORE_FIELDS.length) * 10) / 10
}

export type Criterion = {
  key: "overall" | "convenience" | "variety" | "speed" | "readability" | "security"
  label: string
  field: keyof AppWithScore
  /** DB column name — only present for the 5 real score criteria (not "overall") */
  score?: keyof App
}

export const CRITERIA: Criterion[] = [
  { key: "overall",     label: "종합",   field: "overall" },
  { key: "convenience", label: "편의성", field: "score_convenience", score: "score_convenience" },
  { key: "variety",     label: "다양성", field: "score_variety",     score: "score_variety" },
  { key: "speed",       label: "신속성", field: "score_speed",       score: "score_speed" },
  { key: "readability", label: "가독성", field: "score_readability", score: "score_readability" },
  { key: "security",    label: "보안성", field: "score_security",    score: "score_security" },
]

export type SiteSettings = {
  id: number
  hero_title: string
  hero_subtitle: string
  club_intro_title: string
  club_intro_body: string
  member_count: number
  updated_at: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  hero_title: "대학생이 직접 써본\n모바일 금융앱은\n어땠을까?",
  hero_subtitle: "금융 동아리 MFS가 5가지 기준으로 솔직하게 평가한 핀테크·은행 앱 랭킹",
  club_intro_title: "우리는 MFS 연구회입니다",
  club_intro_body:
    "Mobile Financial Service 연구회는 모바일 금융 서비스를 직접 사용하고 분석하는 서경대학교 금융 동아리입니다. 모든 평가는 멤버들이 실제로 앱을 써본 경험을 바탕으로 합니다.",
  member_count: 14,
  updated_at: "",
}

export function formatDate(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}
