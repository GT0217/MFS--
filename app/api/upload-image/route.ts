import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { isAuthenticated } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // 관리자 세션 확인
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file || !file.size) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const rawExt = (file.name.split(".").pop() || "").toLowerCase()
  const ext = rawExt && rawExt.length <= 5 ? rawExt : "jpg"
  const key = `mfs/inline/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return NextResponse.json({ url: blob.url })
}
