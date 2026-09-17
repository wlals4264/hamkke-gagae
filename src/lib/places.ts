import rawPlaces from "@/data/places.json";
import type { Place, PlaceCategory } from "@/types/place";

/** 서울 전체 25개 구 목록. */
export const GU_LIST: { slug: string; name: string }[] = [
  { slug: "jongno", name: "종로구" },
  { slug: "jung", name: "중구" },
  { slug: "yongsan", name: "용산구" },
  { slug: "seongdong", name: "성동구" },
  { slug: "gwangjin", name: "광진구" },
  { slug: "dongdaemun", name: "동대문구" },
  { slug: "jungnang", name: "중랑구" },
  { slug: "seongbuk", name: "성북구" },
  { slug: "gangbuk", name: "강북구" },
  { slug: "dobong", name: "도봉구" },
  { slug: "nowon", name: "노원구" },
  { slug: "eunpyeong", name: "은평구" },
  { slug: "seodaemun", name: "서대문구" },
  { slug: "mapo", name: "마포구" },
  { slug: "yangcheon", name: "양천구" },
  { slug: "gangseo", name: "강서구" },
  { slug: "guro", name: "구로구" },
  { slug: "geumcheon", name: "금천구" },
  { slug: "yeongdeungpo", name: "영등포구" },
  { slug: "dongjak", name: "동작구" },
  { slug: "gwanak", name: "관악구" },
  { slug: "seocho", name: "서초구" },
  { slug: "gangnam", name: "강남구" },
  { slug: "songpa", name: "송파구" },
  { slug: "gangdong", name: "강동구" },
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
