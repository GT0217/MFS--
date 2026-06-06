import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

const ADMIN_ID = "MFS"
const ADMIN_PASSWORD = "tjrltnrytnsla!"
const COOKIE_NAME = "mfs_admin"
const SESSION_SECRET = "mfs-session-secret-2025-v1"

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex")
}

function makeToken() {
  const payload = `admin.${Date.now()}`
  return `${payload}.${sign(payload)}`
}

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

  const token = makeToken()
  const res = NextResponse.json({ ok: true }, { status: 200 })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  })
  return res
}
