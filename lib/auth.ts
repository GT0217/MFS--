import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "mfs_admin"
const SESSION_TTL = 60 * 60 * 24 * 2
const sessionSecret = () => process.env.ADMIN_SESSION_SECRET

export const ADMIN_ID = process.env.ADMIN_ID ?? ""
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""

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

const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" }

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
