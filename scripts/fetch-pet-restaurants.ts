/**
 * 식품안전나라(foodsafetykorea.go.kr)의 "반려동물 동반 가능 업소 현황" 페이지에서
 * 서울 지역 업소만 뽑아 지오코딩(카카오 로컬 API)한 뒤 src/data/places.json에 합칩니다.
 *
 * 이 데이터는 2026.3.1 시행된 식품위생법 시행규칙 개정에 따라 지자체에 등록한
 * "반려동물 동반 음식점" 현황으로, 별도 인증키 없이 페이지 HTML에 JSON으로 내려옵니다
 * (공식 Open API가 아니라 페이지 파싱이므로, 사이트 구조가 바뀌면 깨질 수 있습니다).
 *
 * 지오코딩(주소 -> 좌표)에는 카카오 로컬 API(REST)를 사용하며 KAKAO_REST_API_KEY가 필요합니다.
 *
 * 실행: npm run fetch:pet-restaurants
 */
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place, PlaceCategory } from "../src/types/place";
import { looksLikeCafe } from "./lib/classify-cafe";

const ROOT = resolve(__dirname, "..");

function loadEnvLocal() {
  try {
    const content = readFileSync(resolve(ROOT, ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local이 없으면 무시
  }
}

loadEnvLocal();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_REST_API_KEY) {
  console.error("KAKAO_REST_API_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const PET_KOREA_URL = "https://www.foodsafetykorea.go.kr/portal/petKorea.do";

/** 도로명주소 -> 구 slug 매핑 (fetch-tour-data.ts와 동일한 구 목록) */
const SEOUL_GU_SLUG: Record<string, string> = {
  종로구: "jongno",
  중구: "jung",
  용산구: "yongsan",
  성동구: "seongdong",
  광진구: "gwangjin",
  동대문구: "dongdaemun",
  중랑구: "jungnang",
  성북구: "seongbuk",
  강북구: "gangbuk",
  도봉구: "dobong",
  노원구: "nowon",
  은평구: "eunpyeong",
  서대문구: "seodaemun",
  마포구: "mapo",
  양천구: "yangcheon",
  강서구: "gangseo",
  구로구: "guro",
  금천구: "geumcheon",
  영등포구: "yeongdeungpo",
  동작구: "dongjak",
  관악구: "gwanak",
  서초구: "seocho",
  강남구: "gangnam",
  송파구: "songpa",
  강동구: "gangdong",
};

function mapCategory(indutyNm: string, name: string): PlaceCategory {
  if (indutyNm === "휴게음식점" || indutyNm === "제과점영업") return "cafe";
  if (looksLikeCafe(name)) return "cafe";
  return "restaurant";
}

interface PetKoreaItem {
  bsshNm: string;
  indutyNm: string;
  lgaldngNm: string;
  siteAddr: string;
}

async function fetchPetKoreaList(): Promise<PetKoreaItem[]> {
  const res = await fetch(PET_KOREA_URL);
  const html = await res.text();
  const marker = 'id="resultListData">';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("resultListData를 찾을 수 없습니다. 페이지 구조가 바뀐 것 같습니다.");
  const jsonStart = start + marker.length;
  const jsonEnd = html.indexOf("</script>", jsonStart);
  return JSON.parse(html.slice(jsonStart, jsonEnd)) as PetKoreaItem[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const cleaned = address.replace(/\([^)]*\)/g, "").trim();
  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", cleaned);

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });
  if (!res.ok) throw new Error(`지오코딩 실패 (${res.status}): ${cleaned}`);
  const json = (await res.json()) as { documents: { x: string; y: string }[] };
  if (json.documents.length === 0) return null;
  return { lat: Number(json.documents[0].y), lng: Number(json.documents[0].x) };
}

function extractGu(address: string): { slug: string; name: string } | null {
  const match = address.match(/서울특별시\s+(\S+?구)\s/);
  if (!match) return null;
  const name = match[1];
  const slug = SEOUL_GU_SLUG[name];
  if (!slug) return null;
  return { slug, name };
}

const outPath = resolve(ROOT, "src/data/places.json");

function loadExistingPlaces(): Map<string, Place> {
  try {
    const arr = JSON.parse(readFileSync(outPath, "utf-8")) as Place[];
    return new Map(arr.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
}

function save(places: Map<string, Place>) {
  const arr = Array.from(places.values());
  writeFileSync(outPath, JSON.stringify(arr, null, 2) + "\n", "utf-8");
  return arr;
}

async function main() {
  console.log("식품안전나라 반려동물 동반 음식점 현황 조회 중...");
  const all = await fetchPetKoreaList();
  const seoul = all.filter((item) => item.lgaldngNm === "서울");
  console.log(`전국 ${all.length}건 중 서울 ${seoul.length}건`);

  const places = loadExistingPlaces();
  let geocoded = 0;
  let skipped = 0;

  for (const [i, item] of seoul.entries()) {
    const gu = extractGu(item.siteAddr);
    if (!gu) {
      skipped++;
      continue;
    }

    let coord: { lat: number; lng: number } | null;
    try {
      coord = await geocodeAddress(item.siteAddr);
    } catch (err) {
      console.error(`  [${i + 1}/${seoul.length}] 지오코딩 오류: ${item.bsshNm} - ${err}`);
      skipped++;
      continue;
    }
    await sleep(80);

    if (!coord) {
      skipped++;
      continue;
    }

    const id = `petkorea-${gu.slug}-${i}`;
    places.set(id, {
      id,
      name: item.bsshNm,
      category: mapCategory(item.indutyNm, item.bsshNm),
      gu: gu.slug,
      guName: gu.name,
      address: item.siteAddr,
      lat: coord.lat,
      lng: coord.lng,
      description: "식약처에 반려동물 동반 음식점으로 등록된 업소입니다.",
      petPolicy: {
        indoor: true,
        leashRequired: true,
        notes: `업태: ${item.indutyNm}`,
      },
      source: "petkorea",
    });
    geocoded++;

    if ((i + 1) % 50 === 0) {
      console.log(`  진행: ${i + 1}/${seoul.length} (성공 ${geocoded}, 스킵 ${skipped})`);
      save(places);
    }
  }

  const arr = save(places);
  console.log(`\n완료: 서울 ${geocoded}건 지오코딩 성공, ${skipped}건 스킵. 총 ${arr.length}건을 ${outPath}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
