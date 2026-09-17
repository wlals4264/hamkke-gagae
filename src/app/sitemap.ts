import type { MetadataRoute } from "next";
import { GU_LIST, CATEGORY_LIST, getAllPlaces } from "@/lib/places";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * 서울 전체 / 구별 / 구+카테고리별 / 장소 상세 페이지를 모두 사이트맵에 포함합니다.
 * "구별로 검색되는" SEO 효과를 위해 만든 페이지들이므로, 사이트맵에서도 누락 없이 노출되도록 관리합니다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const places = getAllPlaces();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/seoul`, changeFrequency: "daily", priority: 1 },
  ];

  const guRoutes: MetadataRoute.Sitemap = GU_LIST.map((gu) => ({
    url: `${siteUrl}/seoul/${gu.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const guCategoryRoutes: MetadataRoute.Sitemap = GU_LIST.flatMap((gu) =>
    CATEGORY_LIST.map((category) => ({
      url: `${siteUrl}/seoul/${gu.slug}/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  );

  const placeRoutes: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${siteUrl}/places/${place.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guRoutes, ...guCategoryRoutes, ...placeRoutes];
}
