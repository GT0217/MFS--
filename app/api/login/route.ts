import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
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

  // next/headers cookies()로 직접 설정 — response.cookies와 달리 확실히 동작
  const store = await cookies()
  store.set(COOKIE_NAME, VALID_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  })

  return NextResponse.json({ ok: true })
}
