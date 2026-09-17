import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import { BRAND_NAME, BRAND_TAGLINE, FEEDBACK_FORM_URL } from "@/lib/constants";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND_NAME} | 서울 반려동물 동반 지도`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    `${BRAND_TAGLINE}. 서울 구별로 반려동물과 함께 갈 수 있는 카페, 식당, 공원, 쇼핑몰을 지도에서 찾아보세요.`,
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
        <footer className="border-t border-ink/10 px-4 py-8 text-center text-xs text-muted">
          <p>{BRAND_TAGLINE} · {BRAND_NAME}</p>
          <p className="mt-2">
            베타 버전입니다 (서울 한정) ·{" "}
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-900"
            >
              하고 싶은 말 남기기
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
