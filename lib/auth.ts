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
    // v0 프리뷰는 iframe(cross-site) 환경이라 SameSite=None + Secure 여야
    // 로그인 이후 Server Action(POST) 요청에도 쿠키가 함께 전송된다.
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  })
}

export async function destroySession() {
  const store = await cookies()
  // sameSite=none + secure 로 만든 쿠키는 삭제 시에도 동일 속성으로
  // 즉시 만료시켜야 cross-site(iframe) 환경에서 브라우저가 실제로 지운다.
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 0,
  })
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === VALID_TOKEN
}

export function isAdminConfigured(): boolean {
  return true
}
