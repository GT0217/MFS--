import { NextRequest, NextResponse } from "next/server"
import { checkCredentials, createSession, isAdminConfigured } from "@/lib/auth"

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

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "관리자 인증 환경변수가 설정되지 않았습니다." }, { status: 503 })
  }
  if (!checkCredentials(id, password)) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 })
  }

  // Server Action과 동일한 HMAC 서명 세션 쿠키를 사용합니다.
  await createSession()
  return NextResponse.json({ ok: true })
}
