import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "mfs_admin"

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "mfs-fallback-secret"
  )
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex")
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
  const adminId = process.env.ADMIN_ID || "MFS"
  const adminPassword = process.env.ADMIN_PASSWORD || "tjrltnrytnsla!"
  return id === adminId && password === adminPassword
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
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
