import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { BottomNav } from "@/components/bottom-nav"
import { SettingsMenu } from "@/components/settings-menu"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "MFS Club · 대학생이 직접 써본 모바일 금융앱",
  description: "대학생 금융 동아리 MFS Club이 직접 사용하고 평가한 모바일 금융앱 랭킹과 인사이트.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MFS Club",
  },
  icons: {
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  // 항상 라이트 테마 고정 — 다크모드 무시
  themeColor: "#f4f6f3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} bg-background`}>
      <body className="font-sans bg-background">
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('mfs-text-size')==='large')document.documentElement.classList.add('text-large');}catch(e){}})();`,
          }}
        />
        <ServiceWorkerRegister />
        {/* 
          스크롤은 <body> 네이티브에서 발생해야 pull-to-refresh가 정상 동작.
          flex-col + min-h-dvh만 유지하고, overflow 제한 클래스는 사용하지 않음.
        */}
        <div className="relative mx-auto w-full max-w-md min-h-dvh bg-background">
          <SettingsMenu />
          <main className="pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
