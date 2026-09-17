import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "함께가개 | 서울 반려동물 동반 지도",
    template: "%s | 함께가개",
  },
  description:
    "서울 구별로 반려동물과 함께 갈 수 있는 카페, 식당, 공원, 쇼핑몰을 지도에서 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.className} antialiased`}>
        <SiteHeader />
        {children}
        <footer className="border-t border-ink/10 px-4 py-8 text-center text-xs text-ink/45">
          함께 걷는 서울을 만듭니다 · 함께가개
        </footer>
      </body>
    </html>
  );
}
