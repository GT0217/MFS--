"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
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

export async function login(_prev: unknown, formData: FormData) {
  const id = String(formData.get("id") || "")
  const password = String(formData.get("password") || "")

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

export async function addRanking(formData: FormData) {
  await requireAuth()
  const name = String(formData.get("name") || "").trim()
  const category = String(formData.get("category") || "종합").trim() || "종합"
  const score = Number(formData.get("score") || 0)
  const note = String(formData.get("note") || "").trim() || null
  if (!name) return

  await getPool().query(
    "INSERT INTO rankings (name, category, score, note) VALUES ($1, $2, $3, $4)",
    [name, category, score, note],
  )
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function updateRanking(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  const name = String(formData.get("name") || "").trim()
  const score = Number(formData.get("score") || 0)
  const note = String(formData.get("note") || "").trim() || null
  if (!id || !name) return

  await getPool().query(
    "UPDATE rankings SET name = $1, score = $2, note = $3, updated_at = now() WHERE id = $4",
    [name, score, note, id],
  )
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function deleteRanking(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  if (!id) return
  await getPool().query("DELETE FROM rankings WHERE id = $1", [id])
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function addInsight(formData: FormData) {
  await requireAuth()
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim()
  const tag = String(formData.get("tag") || "").trim() || null
  if (!title || !body) return

  await getPool().query(
    "INSERT INTO insights (title, body, tag) VALUES ($1, $2, $3)",
    [title, body, tag],
  )
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function deleteInsight(formData: FormData) {
  await requireAuth()
  const id = Number(formData.get("id"))
  if (!id) return
  await getPool().query("DELETE FROM insights WHERE id = $1", [id])
  revalidatePath("/")
  revalidatePath("/admin")
}
