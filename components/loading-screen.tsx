import Image from "next/image"

/**
 * 화면 전환(라우트 이동) 중 표시되는 공통 로딩 화면.
 * 초록 히어로 + 흰색 하단 스켈레톤 대신, 단일 배경색 위에 로고를 띄워
 * 브랜드 아이덴티티를 유지하면서도 깜빡임 없는 부드러운 전환을 제공한다.
 */
export function LoadingScreen() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background animate-loading-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* 회전하는 브랜드 컬러 링 */}
        <span
          className="absolute inset-0 rounded-full border-[3px] border-primary/15 border-t-primary animate-spin"
          style={{ animationDuration: "0.9s" }}
          aria-hidden="true"
        />
        {/* MFS 로고 — 부드러운 펄스 */}
        <Image
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          priority
          className="rounded-xl animate-pulse-soft"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">불러오는 중...</p>
      <span className="sr-only">화면을 불러오는 중입니다</span>
    </div>
  )
}
