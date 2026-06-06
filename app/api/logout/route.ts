import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE_NAME = "mfs_admin"

export async function POST() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}
