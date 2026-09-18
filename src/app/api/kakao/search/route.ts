import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

interface KakaoKeywordDoc {
  place_name: string;
  address_name: string;
  road_address_name: string;
  category_name: string;
  x: string;
  y: string;
}

/** 카카오 장소 키워드 검색. 제보 폼에서 장소를 바로 검색/선택하기 위한 용도. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "검색 기능을 사용할 수 없습니다." }, { status: 500 });
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "8");
  // 서울 중심 좌표로 검색 반경을 넓게 잡아 서울 위주 결과를 우선 노출
  url.searchParams.set("x", "126.978");
  url.searchParams.set("y", "37.5665");
  url.searchParams.set("radius", "20000");

  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!res.ok) {
    return NextResponse.json({ error: "검색에 실패했습니다." }, { status: 502 });
  }

  const json = (await res.json()) as { documents: KakaoKeywordDoc[] };
  const results = json.documents
    .filter((d) => d.address_name.startsWith("서울"))
    .map((d) => ({
      name: d.place_name,
      address: d.road_address_name || d.address_name,
      categoryName: d.category_name,
      lat: Number(d.y),
      lng: Number(d.x),
    }));

  return NextResponse.json({ results });
}
