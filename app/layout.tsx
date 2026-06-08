import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { BottomNav } from "@/components/bottom-nav"
import { SettingsMenu } from "@/components/settings-menu"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "MFS Club · 대학생이 직접 써본 모바일 금융앱",
  description: "대학생 금융 동아리 MFS Club이 직접 사용하고 평가한 모바일 금융앱 랭킹과 인사이트.",
}

export const viewport: Viewport = {
  themeColor: "#6cbf3f",
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
    <html lang="ko" className={`${geistSans.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans">
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mfs-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');if(localStorage.getItem('mfs-text-size')==='large')document.documentElement.classList.add('text-large');}catch(e){}})();`,
          }}
        />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
          <SettingsMenu />
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
