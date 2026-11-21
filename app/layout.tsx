import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// 中文字体只取 latin 子集 + 关掉 preload，避免把上百个 CJK 分片塞进首屏
const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Repo Atlas",
  description: "把值得读的开源项目，拆开看。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable} ${notoSans.variable} ${notoSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
