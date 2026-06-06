import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const ADMIN_ID = "MFS"
const ADMIN_PASSWORD = "tjrltnrytnsla!"
const SESSION_SECRET = "mfs-session-secret-2025-v1"
const COOKIE_NAME = "mfs_admin"

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex")
}

function makeToken() {
  const payload = `admin.${Date.now()}`
  return `${payload}.${sign(payload)}`
}

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null)
  let id = ""
  let password = ""

  if (body) {
    id = String(body.get("id") ?? "").trim()
    password = String(body.get("password") ?? "").trim()
  } else {
    const json = await req.json().catch(() => ({}))
    id = String(json.id ?? "").trim()
    password = String(json.password ?? "").trim()
  }

  if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  const token = makeToken()
  const response = NextResponse.json({ ok: true }, { status: 200 })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return response
}
