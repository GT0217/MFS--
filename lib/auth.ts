import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "mfs_admin"

// 고정 자격증명 — 환경변수에 의존하지 않음
const ADMIN_ID = "MFS"
const ADMIN_PASSWORD = "tjrltnrytnsla!"
const SESSION_SECRET = "mfs-session-secret-2025-v1"

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex")
}

function makeToken() {
  const payload = `admin.${Date.now()}`
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split(".")
  if (parts.length !== 3) return false
  const payload = `${parts[0]}.${parts[1]}`
  const expected = sign(payload)
  try {
    return timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))
  } catch {
    return false
  }
}

export function checkCredentials(id: string, password: string): boolean {
  return id === ADMIN_ID && password === ADMIN_PASSWORD
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifyToken(store.get(COOKIE_NAME)?.value)
}

export function isAdminConfigured(): boolean {
  return true
}
