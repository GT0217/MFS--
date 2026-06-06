import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "서경 MFS · 랭킹 & 인사이트",
  description: "실시간 랭킹과 핵심 인사이트를 한눈에 확인하세요.",
}

export const viewport: Viewport = {
  themeColor: "#14bb51",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} bg-background`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
