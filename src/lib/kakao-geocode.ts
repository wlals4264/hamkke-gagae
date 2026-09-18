import { GU_LIST } from "@/lib/catalog";
import type { PlaceCategory } from "@/types/place";

/** 도로명주소에서 "OO구"를 뽑아 우리 구 slug로 매핑합니다 (fetch-pet-restaurants.ts와 동일한 방식). */
export function extractGuFromAddress(address: string): { slug: string; name: string } | null {
  const match = address.match(/서울(?:특별시)?\s+(\S+?구)\s?/);
  if (!match) return null;
  const gu = GU_LIST.find((g) => g.name === match[1]);
  return gu ? { slug: gu.slug, name: gu.name } : null;
}

/** 카카오 로컬 API(REST)로 주소 -> 좌표 지오코딩. 지도/지오코딩용 앱의 KAKAO_REST_API_KEY를 씁니다. */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error("KAKAO_REST_API_KEY가 설정되어 있지 않습니다.");

  const cleaned = address.replace(/\([^)]*\)/g, "").trim();
  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", cleaned);

  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!res.ok) throw new Error(`지오코딩 실패 (${res.status})`);

  const json = (await res.json()) as { documents: { x: string; y: string }[] };
  if (json.documents.length === 0) return null;
  return { lat: Number(json.documents[0].y), lng: Number(json.documents[0].x) };
}

/** 카카오 장소 검색 결과의 category_name(예: "음식점 > 카페")으로 우리 카테고리를 추정합니다. */
export function guessCategoryFromKakaoCategoryName(categoryName: string): PlaceCategory {
  if (/카페|제과|베이커리/.test(categoryName)) return "cafe";
  if (/관광|공원|숲|산책/.test(categoryName)) return "park";
  if (/쇼핑|백화점|마트|문화/.test(categoryName)) return "mall";
  return "restaurant";
}
