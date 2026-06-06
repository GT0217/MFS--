"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import {
  checkCredentials,
  createSession,
  destroySession,
} from "@/lib/auth"
import { getPool } from "@/lib/db"

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

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
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
  const id = num(formData.get("id"))
  const name = str(formData.get("name"))
  if (!name) return

  const category = str(formData.get("category")) || "핀테크"
  const tagline = str(formData.get("tagline"))
  const description = str(formData.get("description"))
  const accentColor = str(formData.get("accent_color")) || "#14bb51"
  const clubComment = str(formData.get("club_comment"))
  const appStoreUrl = str(formData.get("app_store_url")) || null
  const raterCount = num(formData.get("rater_count"))
  const sortOrder = num(formData.get("sort_order"))
  const tags = parseTags(formData.get("tags"))
  const sc = num(formData.get("score_convenience"))
  const sv = num(formData.get("score_variety"))
  const ss = num(formData.get("score_speed"))
  const sr = num(formData.get("score_readability"))
  const sse = num(formData.get("score_security"))

  const uploaded = await maybeUpload(formData.get("logo"))

  if (id) {
    // 기존 앱 수정
    if (uploaded) {
      const prev = await getPool().query("SELECT logo_url FROM apps WHERE id = $1", [id])
      await safeDelBlob(prev.rows[0]?.logo_url ?? null)
    }

    if (uploaded) {
      // 로고도 함께 업데이트
      await getPool().query(
        `UPDATE apps
         SET name=$1, category=$2, tagline=$3, description=$4, accent_color=$5,
             club_comment=$6, rater_count=$7, sort_order=$8, tags=$9::text[],
             score_convenience=$10, score_variety=$11, score_speed=$12,
             score_readability=$13, score_security=$14,
             app_store_url=$15, logo_url=$16,
             updated_at=now()
         WHERE id=$17`,
        [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags,
         sc, sv, ss, sr, sse, appStoreUrl, uploaded, id],
      )
    } else {
      // 로고 제외 업데이트
      await getPool().query(
        `UPDATE apps
         SET name=$1, category=$2, tagline=$3, description=$4, accent_color=$5,
             club_comment=$6, rater_count=$7, sort_order=$8, tags=$9::text[],
             score_convenience=$10, score_variety=$11, score_speed=$12,
             score_readability=$13, score_security=$14,
             app_store_url=$15, updated_at=now()
         WHERE id=$16`,
        [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags,
         sc, sv, ss, sr, sse, appStoreUrl, id],
      )
    }
  } else {
    // 새 앱 추가
    await getPool().query(
      `INSERT INTO apps
         (name, category, tagline, description, accent_color, club_comment, rater_count,
          sort_order, tags, score_convenience, score_variety, score_speed,
          score_readability, score_security, logo_url, app_store_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11,$12,$13,$14,$15,$16)`,
      [name, category, tagline, description, accentColor, clubComment, raterCount, sortOrder, tags,
       sc, sv, ss, sr, sse, uploaded, appStoreUrl],
    )
  }
  revalidateAll()
}

export async function deleteApp(formData: FormData) {
  const id = num(formData.get("id"))
  if (!id) return
  const prev = await getPool().query("SELECT logo_url FROM apps WHERE id = $1", [id])
  await safeDelBlob(prev.rows[0]?.logo_url ?? null)
  await getPool().query("DELETE FROM apps WHERE id = $1", [id])
  revalidateAll()
}

/* ---------------- insights ---------------- */

export async function saveInsight(formData: FormData) {
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

    if (uploaded) {
      await getPool().query(
        `UPDATE insights
         SET type=$1, category=$2, title=$3, summary=$4, body=$5, author=$6,
             published_on=$7, sort_order=$8, image_url=$9
         WHERE id=$10`,
        [type, category, title, summary, body, author, publishedOn || null, sortOrder, uploaded, id],
      )
    } else {
      await getPool().query(
        `UPDATE insights
         SET type=$1, category=$2, title=$3, summary=$4, body=$5, author=$6,
             published_on=$7, sort_order=$8
         WHERE id=$9`,
        [type, category, title, summary, body, author, publishedOn || null, sortOrder, id],
      )
    }
  } else {
    await getPool().query(
      `INSERT INTO insights
         (type, category, title, summary, body, author, published_on, sort_order, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [type, category, title, summary, body, author, publishedOn || null, sortOrder, uploaded],
    )
  }
  revalidateAll()
}

export async function deleteInsight(formData: FormData) {
  const id = num(formData.get("id"))
  if (!id) return
  const prev = await getPool().query("SELECT image_url FROM insights WHERE id = $1", [id])
  await safeDelBlob(prev.rows[0]?.image_url ?? null)
  await getPool().query("DELETE FROM insights WHERE id = $1", [id])
  revalidateAll()
}

/* ---------------- site settings ---------------- */

export async function saveSiteSettings(formData: FormData) {
  const heroTitle = str(formData.get("hero_title")) || "대학생이 직접 써본\n모바일 금융앱은\n어땠을까?"
  const heroSubtitle = str(formData.get("hero_subtitle")) || "금융 동아리 MFS가 5가지 기준으로 솔직하게 평가한 핀테크·은행 앱 랭킹"
  const clubIntroTitle = str(formData.get("club_intro_title")) || "우리는 MFS 연구회입니다"
  const clubIntroBody = str(formData.get("club_intro_body")) || ""
  const memberCount = num(formData.get("member_count"), 14)

  await getPool().query(
    `UPDATE site_settings
     SET hero_title=$1, hero_subtitle=$2, club_intro_title=$3, club_intro_body=$4,
         member_count=$5, updated_at=now()
     WHERE id=1`,
    [heroTitle, heroSubtitle, clubIntroTitle, clubIntroBody, memberCount],
  )

  revalidatePath("/")
  revalidatePath("/admin")
}
