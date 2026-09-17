import rawPlaces from "@/data/places.json";
import type { Place, PlaceCategory } from "@/types/place";

/**
 * MVP 대상 구 목록. 서울 전체 25개 구 중 데이터가 채워진 구만 우선 노출합니다.
 * 확장 시 이 배열에 구를 추가하고 src/data/places.json에 해당 구 데이터를 채우면 됩니다.
 */
export const GU_LIST: { slug: string; name: string }[] = [
  { slug: "mapo", name: "마포구" },
  { slug: "seongdong", name: "성동구" },
  { slug: "gangnam", name: "강남구" },
  { slug: "yongsan", name: "용산구" },
  { slug: "jongno", name: "종로구" },
];

export const CATEGORY_LIST: { slug: PlaceCategory; name: string; emoji: string }[] = [
  { slug: "cafe", name: "카페", emoji: "☕️" },
  { slug: "restaurant", name: "식당", emoji: "🍽️" },
  { slug: "park", name: "공원·산책로", emoji: "🌳" },
  { slug: "mall", name: "쇼핑몰·문화공간", emoji: "🛍️" },
];

const places = rawPlaces as Place[];

export function getAllPlaces(): Place[] {
  return places;
}

export function getGuBySlug(slug: string) {
  return GU_LIST.find((g) => g.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return CATEGORY_LIST.find((c) => c.slug === slug);
}

export function getPlacesByGu(guSlug: string): Place[] {
  return places.filter((p) => p.gu === guSlug);
}

export function getPlacesByGuAndCategory(guSlug: string, categorySlug: string): Place[] {
  return places.filter((p) => p.gu === guSlug && p.category === categorySlug);
}

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

/** 특정 장소와 가까운 순으로 다른 장소 몇 곳을 추천 (상세페이지 "주변 다른 장소" 섹션용) */
export function getNearbyPlaces(place: Place, limit = 3): Place[] {
  return places
    .filter((p) => p.id !== place.id && p.gu === place.gu)
    .slice(0, limit);
}
