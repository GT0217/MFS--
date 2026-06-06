"use client"

import { logout } from "@/app/actions"

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
      >
        로그아웃
      </button>
    </form>
  )
}
