import type { AppWithScore } from "@/lib/types"

export function AppLogo({
  app,
  size = 48,
  className = "",
}: {
  app: Pick<AppWithScore, "name" | "logo_url" | "accent_color">
  size?: number
  className?: string
}) {
  if (app.logo_url) {
    return (
      <img
        src={app.logo_url || "/placeholder.svg"}
        alt={`${app.name} 로고`}
        width={size}
        height={size}
        className={`rounded-2xl object-cover ${className}`}
        style={{ width: size, height: size }}
        crossOrigin="anonymous"
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-2xl font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: app.accent_color || "#14bb51",
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {app.name.slice(0, 1)}
    </div>
  )
}
