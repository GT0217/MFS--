import { NextRequest, NextResponse } from "next/server"
import { ADMIN_ID, ADMIN_PASSWORD } from "@/lib/auth"

const COOKIE_NAME = "mfs_admin"
const VALID_TOKEN = "mfs-admin-token-2025-fixed"

export async function POST(req: NextRequest) {
  let id = ""
  let password = ""

  try {
    const json = await req.json()
    id = String(json.id ?? "").trim()
    password = String(json.password ?? "").trim()
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }

  if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  // next/headers 대신 Response에 직접 Set-Cookie 헤더를 추가합니다
  const maxAge = 60 * 60 * 24 * 30
  const cookieValue = `${COOKIE_NAME}=${VALID_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`

  const response = NextResponse.json({ ok: true })
  response.headers.set("Set-Cookie", cookieValue)
  return response
}
