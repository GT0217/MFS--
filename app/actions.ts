"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import {
  checkCredentials,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth"
import { getPool } from "@/lib/db"

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized")
  }
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim()
}

function parseTags(v: FormDataEntryValue | null): string[] {
  return str(v)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

async function maybeUpload(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || typeof file === "string") return null
  const f = file as File
  if (!f.size) return null
  const ext = f.name.split(".").pop() || "png"
  const blob = await put(`mfs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, f, {
    access: "public",
  })
  return blob.url
}

async function safeDelBlob(url: string | null) {
  if (!url || !url.includes("blob.vercel-storage.com")) return
  try {
    await del(url)
  } catch {
    // ignore
  }
}

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/ranking")
  revalidatePath("/insights")
  revalidatePath("/recommend")
  revalidatePath("/admin")
}

/* ---------------- auth ---------------- */

export async function login(_prev: unknown, formData: FormData) {
  const id = str(formData.get("id"))
  const password = str(formData.get("password"))
  if (!checkCredentials(id, password)) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." }
  }
  await createSession()
  redirect("/admin")
}

export async function logout() {
  await destroySession()
  redirect("/admin")
}

/* ---------------- apps ---------------- */

export async function saveApp(formData: FormData) {
  await requireAuth()
  const id = num(formData.get("id"))
  const name = str(formData.get("name"))
  if (!name) return

  const category = str(formData.get("category")) || "핀테크"
  const tagline = str(formData.get("tagline")) || null
  const description = str(formData.get("description")) || null
  const accentColor = str(formData.get("accent_color")) || "#14bb51"
  const clubComment = str(formData.get("club_comment")) || null
  const raterCount = num(formData.get("rater_count"))
  const sortOrder = num(formData.get("sort_order"))
  const tags = JSON.stringify(parseTags(formData.get("tags")))
  const sc = num(formData.get("score_convenience"))
  const sv = num(formData.get("score_variety"))
  const ss = num(formData.get("score_speed"))
  const sr = num(formData.get("score_readability"))
  const sse = num(formData.get("score_security"))

  const uploaded = await maybeUpload(formData.get("logo"))

  if (id) {
    if (uploaded) {
      const prev = await getPool().query("SELECT logo_url FROM apps WHERE id = $1", [id])
      await safeDelBlob(prev.rows[0]?.logo_url ?? null)
    }
    await getPool().query(
      `UPDATE apps SET name=$1, category=$2, tagline=$3, description=$4, accent_color=$5,
         club_comment=$6, rater_count=$7, sort_order=$8, tags=$9::jsonb,
         score_convenience=$10, score_variety=$11, score_speed=$12, score_readability=$13, score_security=$14,
         ${uploaded ? "logo_url=$16," : ""} updated_at=now()
       WHERE id=$15`,
      uploaded
        ? [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags, sc, sv, ss, sr, sse, id, uploaded]
        : [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags, sc, sv, ss, sr, sse, id],
    )
  } else {
    await getPool().query(
      `INSERT INTO apps (name, category, tagline, description, accent_color, club_comment, rater_count, sort_order, tags,
         score_convenience, score_variety, score_speed, score_readability, score_security, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15)`,
      [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags, sc, sv, ss, sr, sse, uploaded],
    )
  }
  revalidateAll()
}

export async function deleteApp(formData: FormData) {
  await requireAuth()
  const id = num(formData.get("id"))
  if (!id) return
  const prev = await getPool().query("SELECT logo_url FROM apps WHERE id = $1", [id])
  await safeDelBlob(prev.rows[0]?.logo_url ?? null)
  await getPool().query("DELETE FROM apps WHERE id = $1", [id])
  revalidateAll()
}

/* ---------------- insights ---------------- */

export async function saveInsight(formData: FormData) {
  await requireAuth()
  const id = num(formData.get("id"))
  const title = str(formData.get("title"))
  if (!title) return

  const type = str(formData.get("type")) || "칼럼"
  const category = str(formData.get("category")) || null
  const summary = str(formData.get("summary")) || null
  const body = str(formData.get("body")) || null
  const author = str(formData.get("author")) || null
  const publishedOn = str(formData.get("published_on")) || null
  const sortOrder = num(formData.get("sort_order"))

  const uploaded = await maybeUpload(formData.get("image"))

  if (id) {
    if (uploaded) {
      const prev = await getPool().query("SELECT image_url FROM insights WHERE id = $1", [id])
      await safeDelBlob(prev.rows[0]?.image_url ?? null)
    }
    await getPool().query(
      `UPDATE insights SET type=$1, category=$2, title=$3, summary=$4, body=$5, author=$6,
         published_on=$7, sort_order=$8 ${uploaded ? ", image_url=$10" : ""}
       WHERE id=$9`,
      uploaded
        ? [type, category, title, summary, body, author, publishedOn || null, sortOrder, id, uploaded]
        : [type, category, title, summary, body, author, publishedOn || null, sortOrder, id],
    )
  } else {
    await getPool().query(
      `INSERT INTO insights (type, category, title, summary, body, author, published_on, sort_order, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [type, category, title, summary, body, author, publishedOn || null, sortOrder, uploaded],
    )
  }
  revalidateAll()
}

export async function deleteInsight(formData: FormData) {
  await requireAuth()
  const id = num(formData.get("id"))
  if (!id) return
  const prev = await getPool().query("SELECT image_url FROM insights WHERE id = $1", [id])
  await safeDelBlob(prev.rows[0]?.image_url ?? null)
  await getPool().query("DELETE FROM insights WHERE id = $1", [id])
  revalidateAll()
}
