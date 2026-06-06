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
  field: keyof App | "overall"
}

export const CRITERIA: Criterion[] = [
  { key: "overall", label: "종합", field: "overall" },
  { key: "convenience", label: "편의성", field: "score_convenience" },
  { key: "variety", label: "다양성", field: "score_variety" },
  { key: "speed", label: "신속성", field: "score_speed" },
  { key: "readability", label: "가독성", field: "score_readability" },
  { key: "security", label: "보안성", field: "score_security" },
]

export function formatDate(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}
