import { cookies } from "next/headers"

const COOKIE_NAME = "mfs_admin"
// 고정 토큰 — 환경변수 없이 항상 동일하게 동작
const VALID_TOKEN = "mfs-admin-token-2025-fixed"

export const ADMIN_ID = "MFS"
export const ADMIN_PASSWORD = "tjrltnrytnsla!"

export function checkCredentials(id: string, password: string): boolean {
  return id.trim() === ADMIN_ID && password.trim() === ADMIN_PASSWORD
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, VALID_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === VALID_TOKEN
}

export function isAdminConfigured(): boolean {
  return true
}
