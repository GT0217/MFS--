import { Pool } from "pg"

let pool: Pool | undefined

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

export type Ranking = {
  id: number
  name: string
  category: string
  score: number
  note: string | null
  created_at: string
  updated_at: string
}

export type Insight = {
  id: number
  title: string
  body: string
  tag: string | null
  created_at: string
}

export async function getRankings(): Promise<Ranking[]> {
  const { rows } = await getPool().query<Ranking>(
    "SELECT * FROM rankings ORDER BY score DESC, name ASC",
  )
  return rows
}

export async function getInsights(): Promise<Insight[]> {
  const { rows } = await getPool().query<Insight>(
    "SELECT * FROM insights ORDER BY created_at DESC",
  )
  return rows
}
