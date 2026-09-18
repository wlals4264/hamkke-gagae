import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep review builds separate from a running development server.
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  /**
   * 실제 배포 시 사이트 도메인으로 교체하세요.
   * sitemap.ts / robots.ts / JSON-LD의 절대경로 URL 생성에 사용됩니다.
   */
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
  /**
   * 프로젝트를 seoul-pet-map -> kkori-ttara로 개명한 뒤에도 옛 vercel.app 도메인이
   * 남아있어 카카오맵 도메인 인증(kkori-ttara.vercel.app만 등록됨)에 걸립니다.
   * 옛 도메인 접속은 새 도메인으로 영구 리다이렉트합니다.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "seoul-pet-map.vercel.app" }],
        destination: "https://kkori-ttara.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
