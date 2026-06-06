import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, SESSION_TOKEN } from "@/lib/auth"

const ADMIN_ID = "MFS"
const ADMIN_PASSWORD = "tjrltnrytnsla!"

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}))
  const id = String(json.id ?? "").trim()
  const password = String(json.password ?? "").trim()

  if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ ok: true }, { status: 200 })
  response.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return response
}
