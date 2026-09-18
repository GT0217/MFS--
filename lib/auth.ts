import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "mfs_admin"
const SESSION_TTL = 60 * 60 * 24 * 2

// 배포 환경변수가 있으면 우선 사용하고, 로컬/미설정 환경에서도 동일한 관리자 계정으로 로그인할 수 있게 합니다.
const DEFAULT_ADMIN_ID = "MFS"
const DEFAULT_ADMIN_PASSWORD = "tjrltnrytnsla!"
const DEFAULT_SESSION_SECRET = "mfs-admin-session-secret-2025"

const sessionSecret = () => process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET

export const ADMIN_ID = process.env.ADMIN_ID || DEFAULT_ADMIN_ID
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_ID && ADMIN_PASSWORD && sessionSecret())
}

export function checkCredentials(id: string, password: string): boolean {
  return isAdminConfigured() && id.trim() === ADMIN_ID && password.trim() === ADMIN_PASSWORD
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()!).update(payload).digest("base64url")
}

function createToken(): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL
  const payload = `mfs:${expires}`
  return `${payload}.${sign(payload)}`
}

function validToken(token: string | undefined): boolean {
  if (!token || !sessionSecret()) return false
  const [payload, signature] = token.split(".")
  const expected = sign(payload ?? "")
  if (!signature || signature.length !== expected.length) return false
  try {
    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    const expires = Number(payload?.split(":")[1])
    return valid && Number.isSafeInteger(expires) && expires > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  // HTTPS 배포에서는 Secure, http://localhost 개발 환경에서는 일반 쿠키를 사용합니다.
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, createToken(), { ...cookieOptions, maxAge: SESSION_TTL })
}

export async function destroySession() {
  const store = await cookies()
  store.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 })
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return isAdminConfigured() && validToken(store.get(COOKIE_NAME)?.value)
}

/** Server Actions must call this before any database or Blob mutation. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized")
  }
}
