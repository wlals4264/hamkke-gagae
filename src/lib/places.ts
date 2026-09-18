import rawPlaces from "@/data/places.json";
import type { Place, PlaceCategory } from "@/types/place";
import { getApprovedPlaceById, getApprovedPlaces } from "@/lib/submissions";
import { GU_LIST, CATEGORY_LIST } from "@/lib/catalog";

export { GU_LIST, CATEGORY_LIST } from "@/lib/catalog";

const staticPlaces = rawPlaces as Place[];

/** 정적 JSON(TourAPI/식약처) + 제보 승인분(Supabase)을 합친 전체 장소 목록. */
export async function getAllPlaces(): Promise<Place[]> {
  const approved = await getApprovedPlaces();
  return [...staticPlaces, ...approved];
}

export function getGuBySlug(slug: string) {
  return GU_LIST.find((g) => g.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return CATEGORY_LIST.find((c) => c.slug === slug);
}

export async function getPlacesByGu(guSlug: string): Promise<Place[]> {
  const all = await getAllPlaces();
  return all.filter((p) => p.gu === guSlug);
}

export async function getPlacesByGuAndCategory(guSlug: string, categorySlug: string): Promise<Place[]> {
  const all = await getAllPlaces();
  return all.filter((p) => p.gu === guSlug && p.category === categorySlug);
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  const staticMatch = staticPlaces.find((p) => p.id === id);
  if (staticMatch) return staticMatch;
  return getApprovedPlaceById(id);
}

/** 특정 장소와 가까운 순으로 다른 장소 몇 곳을 추천 (상세페이지 "주변 다른 장소" 섹션용) */
export async function getNearbyPlaces(place: Place, limit = 3): Promise<Place[]> {
  const all = await getAllPlaces();
  return all.filter((p) => p.id !== place.id && p.gu === place.gu).slice(0, limit);
}
