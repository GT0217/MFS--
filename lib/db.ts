import "server-only"
import { Pool } from "pg"
import { type App, type AppWithScore, type Insight, overallScore } from "./types"

export * from "./types"

let pool: Pool | undefined

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
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
  return rows
}
