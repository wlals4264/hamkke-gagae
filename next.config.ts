import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 실제 배포 시 사이트 도메인으로 교체하세요.
   * sitemap.ts / robots.ts / JSON-LD의 절대경로 URL 생성에 사용됩니다.
   */
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
