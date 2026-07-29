import "server-only"
import { Pool } from "pg"
import { type App, type AppWithScore, type Insight, type InsightCategoryRow, type News, type SiteSettings, DEFAULT_SITE_SETTINGS, overallScore, INSIGHT_CATEGORIES } from "./types"

export * from "./types"

let pool: Pool | undefined

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL_NON_POOLING
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  }
  return pool
}

function normalize(row: App): AppWithScore {
  const app: App = {
    ...row,
    score_convenience: Number(row.score_convenience),
    score_variety: Number(row.score_variety),
    score_speed: Number(row.score_speed),
    score_readability: Number(row.score_readability),
    score_security: Number(row.score_security),
    tags: Array.isArray(row.tags) ? row.tags : [],
    // criteria_count 컬럼이 DB에 없는 경우를 대비해 기본값 주입
    criteria_count: Number(row.criteria_count) || 5,
  }
  return { ...app, overall: overallScore(app) }
}

export async function getApps(): Promise<AppWithScore[]> {
  const { rows } = await getPool().query<App>("SELECT * FROM apps ORDER BY sort_order ASC, id ASC")
  return rows.map(normalize)
}

export async function getApp(id: number): Promise<AppWithScore | null> {
  const { rows } = await getPool().query<App>("SELECT * FROM apps WHERE id = $1", [id])
  return rows[0] ? normalize(rows[0]) : null
}

export async function getInsights(): Promise<Insight[]> {
  const { rows } = await getPool().query<Insight>(
    "SELECT * FROM insights ORDER BY sort_order ASC, created_at DESC",
  )
  return rows.map((r) => ({
    ...r,
    image_urls: Array.isArray(r.image_urls) ? r.image_urls : [],
  }))
}

export async function getInsightCategories(): Promise<InsightCategoryRow[]> {
  try {
    const { rows } = await getPool().query<InsightCategoryRow>(
      "SELECT * FROM insight_categories ORDER BY sort_order ASC, id ASC",
    )
    // DB가 비어있으면 하드코딩 폴백 반환
    if (rows.length === 0) {
      return INSIGHT_CATEGORIES.map((c, i) => ({
        id: i + 1,
        name: c.value,
        sort_order: i,
        created_at: "",
      }))
    }
    return rows
  } catch {
    return INSIGHT_CATEGORIES.map((c, i) => ({
      id: i + 1,
      name: c.value,
      sort_order: i,
      created_at: "",
    }))
  }
}

export async function getNews(): Promise<News[]> {
  try {
    const { rows } = await getPool().query<News>(
      "SELECT * FROM news ORDER BY sort_order ASC, created_at DESC",
    )
    return rows
  } catch {
    return []
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { rows } = await getPool().query<SiteSettings>(
      "SELECT * FROM site_settings WHERE id = 1",
    )
    return rows[0] ?? DEFAULT_SITE_SETTINGS
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}
