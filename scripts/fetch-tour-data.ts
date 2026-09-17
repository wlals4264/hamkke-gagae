/**
 * 한국관광공사 TourAPI(KorService2)에서 서울 25개 구의 반려동물 동반 장소를 가져와
 * src/data/places.json을 생성합니다. 빌드 시점에 한 번 실행하는 스크립트입니다.
 *
 * 실행: npm run fetch:tour-data
 * (TOUR_API_KEY는 .env.local에 저장돼 있어야 합니다)
 */
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place, PlaceCategory } from "../src/types/place";

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
    // .env.local이 없으면 무시 (CI 등에서 환경변수로 직접 주입하는 경우)
  }
}

loadEnvLocal();

const TOUR_API_KEY = process.env.TOUR_API_KEY;
if (!TOUR_API_KEY) {
  console.error("TOUR_API_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const END_POINT = "https://apis.data.go.kr/B551011/KorService2";
const MOBILE_APP = "hamkkegagae";

/** 서울 25개 구: slug(로마자) / 한글명 / 법정동 시군구코드(lDongSignguCd) */
const SEOUL_GU: { slug: string; name: string; code: string }[] = [
  { slug: "jongno", name: "종로구", code: "110" },
  { slug: "jung", name: "중구", code: "140" },
  { slug: "yongsan", name: "용산구", code: "170" },
  { slug: "seongdong", name: "성동구", code: "200" },
  { slug: "gwangjin", name: "광진구", code: "215" },
  { slug: "dongdaemun", name: "동대문구", code: "230" },
  { slug: "jungnang", name: "중랑구", code: "260" },
  { slug: "seongbuk", name: "성북구", code: "290" },
  { slug: "gangbuk", name: "강북구", code: "305" },
  { slug: "dobong", name: "도봉구", code: "320" },
  { slug: "nowon", name: "노원구", code: "350" },
  { slug: "eunpyeong", name: "은평구", code: "380" },
  { slug: "seodaemun", name: "서대문구", code: "410" },
  { slug: "mapo", name: "마포구", code: "440" },
  { slug: "yangcheon", name: "양천구", code: "470" },
  { slug: "gangseo", name: "강서구", code: "500" },
  { slug: "guro", name: "구로구", code: "530" },
  { slug: "geumcheon", name: "금천구", code: "545" },
  { slug: "yeongdeungpo", name: "영등포구", code: "560" },
  { slug: "dongjak", name: "동작구", code: "590" },
  { slug: "gwanak", name: "관악구", code: "620" },
  { slug: "seocho", name: "서초구", code: "650" },
  { slug: "gangnam", name: "강남구", code: "680" },
  { slug: "songpa", name: "송파구", code: "710" },
  { slug: "gangdong", name: "강동구", code: "740" },
];

/** 이 앱이 다루는 카테고리에 대응되는 TourAPI contentTypeId만 사용합니다. */
const RELEVANT_CONTENT_TYPES = new Set(["12", "38", "39"]);

function mapCategory(contenttypeid: string, cat2: string): PlaceCategory | null {
  if (contenttypeid === "12") return "park";
  if (contenttypeid === "38") return "mall";
  if (contenttypeid === "39") return cat2 === "FD02" ? "cafe" : "restaurant";
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callApi<T = unknown>(operation: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${END_POINT}/${operation}`);
  url.searchParams.set("serviceKey", TOUR_API_KEY!);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", MOBILE_APP);
  url.searchParams.set("_type", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`${operation} 호출 실패: HTTP ${res.status}`);
  const json = await res.json();
  if (json.resultCode && json.resultCode !== "0000") {
    throw new Error(`${operation} 호출 실패: ${json.resultMsg ?? JSON.stringify(json)}`);
  }
  return json;
}

interface AreaBasedItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  cat2: string;
}

interface DetailCommonItem {
  contentid: string;
  title: string;
  addr1: string;
  addr2: string;
  mapx: string;
  mapy: string;
  overview: string;
}

interface DetailPetTourItem {
  acmpyTypeCd: string;
  etcAcmpyInfo: string;
  acmpyPsblCpam: string;
  acmpyNeedMtr: string;
}

async function fetchAreaBasedList(guCode: string): Promise<AreaBasedItem[]> {
  const json = await callApi<{
    response: { body: { items: "" | { item: AreaBasedItem[] } } };
  }>("areaBasedList2", {
    lDongRegnCd: "11",
    lDongSignguCd: guCode,
    numOfRows: "60",
    pageNo: "1",
  });
  const items = json.response.body.items;
  if (items === "") return [];
  return items.item.filter((it) => RELEVANT_CONTENT_TYPES.has(it.contenttypeid)).slice(0, 35);
}

async function fetchPetTour(contentId: string): Promise<DetailPetTourItem | null> {
  const json = await callApi<{
    response: { body: { items: "" | { item: DetailPetTourItem[] }; totalCount: number } };
  }>("detailPetTour2", { contentId });
  const body = json.response.body;
  if (body.totalCount === 0 || body.items === "") return null;
  return body.items.item[0];
}

async function fetchDetailCommon(contentId: string): Promise<DetailCommonItem | null> {
  const json = await callApi<{
    response: { body: { items: "" | { item: DetailCommonItem[] } } };
  }>("detailCommon2", { contentId });
  const items = json.response.body.items;
  if (items === "") return null;
  return items.item[0];
}

function buildPetPolicyNotes(pet: DetailPetTourItem): string {
  return [pet.acmpyTypeCd, pet.etcAcmpyInfo, pet.acmpyNeedMtr, pet.acmpyPsblCpam]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(" / ");
}

async function main() {
  const places: Place[] = [];

  for (const gu of SEOUL_GU) {
    console.log(`[${gu.name}] 관광정보 조회 중...`);
    const candidates = await fetchAreaBasedList(gu.code);
    await sleep(150);

    let guHitCount = 0;
    for (const candidate of candidates) {
      const category = mapCategory(candidate.contenttypeid, candidate.cat2);
      if (!category) continue;

      const pet = await fetchPetTour(candidate.contentid);
      await sleep(120);
      if (!pet) continue;

      const detail = await fetchDetailCommon(candidate.contentid);
      await sleep(120);
      if (!detail) continue;

      const lat = Number(detail.mapy);
      const lng = Number(detail.mapx);
      if (!lat || !lng) continue;

      places.push({
        id: `tourapi-${candidate.contentid}`,
        name: detail.title,
        category,
        gu: gu.slug,
        guName: gu.name,
        address: [detail.addr1, detail.addr2].filter(Boolean).join(" "),
        lat,
        lng,
        description: (detail.overview || detail.title).slice(0, 200),
        petPolicy: {
          indoor: /실내|전구역/.test(pet.acmpyTypeCd ?? ""),
          leashRequired: true,
          notes: buildPetPolicyNotes(pet) || undefined,
        },
        source: "tourapi",
      });
      guHitCount++;
    }
    console.log(`  → ${guHitCount}건 반려동물 동반 장소 확보`);
  }

  const outPath = resolve(ROOT, "src/data/places.json");
  writeFileSync(outPath, JSON.stringify(places, null, 2) + "\n", "utf-8");
  console.log(`\n완료: 총 ${places.length}건을 ${outPath}에 저장했습니다.`);

  const byGu = new Map<string, number>();
  for (const p of places) byGu.set(p.guName, (byGu.get(p.guName) ?? 0) + 1);
  console.log("\n구별 건수:");
  for (const gu of SEOUL_GU) {
    console.log(`  ${gu.name}: ${byGu.get(gu.name) ?? 0}건`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
