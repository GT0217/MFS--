"use client"

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" })
    window.location.href = "/admin"
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
    >
      로그아웃
    </button>
  )
}
