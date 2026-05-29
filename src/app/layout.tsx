import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sleep Recovery AI",
  description: "AI 熬夜恢复助手 — 根据你的睡眠数据生成个性化恢复建议",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="relative mx-auto min-h-full max-w-md bg-mesh">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none fixed inset-0 mx-auto max-w-md overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute bottom-1/3 left-0 h-60 w-60 rounded-full bg-purple-500/8 blur-[80px]" />
            <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-indigo-500/6 blur-[80px]" />
          </div>

          <main
            className="relative z-10 flex min-h-full flex-col px-5 pt-12"
            style={{
              paddingBottom: "max(2rem, env(safe-area-inset-bottom, 1rem))",
            }}
          >
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
