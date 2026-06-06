import { cookies } from "next/headers"

export const COOKIE_NAME = "mfs_admin"
export const SESSION_TOKEN = "mfs-logged-in-2025"

export function checkCredentials(id: string, password: string): boolean {
  return id === "MFS" && password === "tjrltnrytnsla!"
}

export async function createSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, SESSION_TOKEN, {
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
  return store.get(COOKIE_NAME)?.value === SESSION_TOKEN
}

export function isAdminConfigured(): boolean {
  return true
}
