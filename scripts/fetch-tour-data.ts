/**
 * 한국관광공사 TourAPI(KorService2)에서 서울 25개 구의 반려동물 동반 장소를 가져와
 * src/data/places.json을 생성합니다. 빌드 시점에 한 번 실행하는 스크립트입니다.
 *
 * 실행: npm run fetch:tour-data
 * (TOUR_API_KEY는 .env.local에 저장돼 있어야 합니다)
 *
 * 이미 확인한 contentId는 scripts/.tour-checked-ids.json에 기록해두므로, 쿼터 초과로 중단된 뒤
 * 다시 실행해도 같은 곳을 재조회하지 않고 이어서 진행합니다.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place, PlaceCategory } from "../src/types/place";
import { looksLikeCafe } from "./lib/classify-cafe";
import { truncateDescription } from "./lib/truncate-description";

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
const MOBILE_APP = "kkori-ttara";

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

function mapCategory(contenttypeid: string, name: string): PlaceCategory | null {
  if (contenttypeid === "12") return "park";
  if (contenttypeid === "38") return "mall";
  // contentTypeId=39(음식점)의 cat2는 항상 "A0502"(대분류) 하나뿐이라 카페/일반음식점 구분이
  // cat2로는 불가능합니다(세부 구분은 cat3 레벨). 이름에 카페/커피 키워드가 있으면 cafe로 보정하고,
  // 나머지는 일반음식점으로 분류합니다.
  if (contenttypeid === "39") return looksLikeCafe(name) ? "cafe" : "restaurant";
  return null;
}

/**
 * 반려동물 동반 태그는 contentTypeId=38(쇼핑)에 압도적으로 몰려있고 39(음식점·카페)/12(관광지·공원)엔
 * 드뭅니다. 카테고리 편중을 막기 위해 타입별로 후보 수집량과 detailPetTour2 확인량을 따로 둡니다.
 *
 * detailPetTour2는 구당 최대 checkLimit 합(30)만큼 호출되므로 25개 구를 다 돌아도 750건으로,
 * data.go.kr의 오퍼레이션별 하루 호출 한도(1,000건) 안에서 전체를 한 번에 끝낼 수 있습니다.
 */
const CONTENT_TYPE_PLAN: { contentTypeId: string; numOfRows: number; checkLimit: number }[] = [
  { contentTypeId: "39", numOfRows: 60, checkLimit: 20 }, // 음식점·카페
  { contentTypeId: "12", numOfRows: 30, checkLimit: 7 }, // 관광지(공원 등)
  { contentTypeId: "38", numOfRows: 10, checkLimit: 3 }, // 쇼핑 (이미 충분히 잘 잡히므로 소량만)
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 공공데이터포털 일일 쿼터 초과 시 호출을 멈추기 위한 신호용 에러 */
class QuotaExceededError extends Error {}

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
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new QuotaExceededError(`${operation} 응답이 JSON이 아닙니다 (쿼터 초과 가능성): ${text.slice(0, 200)}`);
  }

  // data.go.kr 게이트웨이 레벨 에러(쿼터 초과, 인증키 오류 등)는 response 래퍼 없이 내려옵니다.
  const gatewayError = json.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (gatewayError) {
    if (gatewayError.returnReasonCode === "22" || /LIMITED_NUMBER/.test(gatewayError.errMsg ?? "")) {
      throw new QuotaExceededError(`${operation}: ${gatewayError.returnAuthMsg ?? gatewayError.errMsg}`);
    }
    throw new Error(`${operation} 게이트웨이 오류: ${gatewayError.returnAuthMsg ?? gatewayError.errMsg}`);
  }

  if (json.resultCode && json.resultCode !== "0000") {
    if (json.resultCode === "22" || /LIMITED_NUMBER/.test(json.resultMsg ?? "")) {
      throw new QuotaExceededError(`${operation}: ${json.resultMsg}`);
    }
    throw new Error(`${operation} 호출 실패: ${json.resultMsg ?? text.slice(0, 200)}`);
  }
  if (!json.response) {
    throw new QuotaExceededError(`${operation} 응답 형식이 예상과 다릅니다: ${text.slice(0, 200)}`);
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

async function fetchAreaBasedList(guCode: string, contentTypeId: string, numOfRows: number): Promise<AreaBasedItem[]> {
  const json = await callApi<{
    response: { body: { items: "" | { item: AreaBasedItem[] } } };
  }>("areaBasedList2", {
    lDongRegnCd: "11",
    lDongSignguCd: guCode,
    contentTypeId,
    numOfRows: String(numOfRows),
    pageNo: "1",
  });
  const items = json.response.body.items;
  if (items === "") return [];
  return items.item;
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

const outPath = resolve(ROOT, "src/data/places.json");
/** 이미 확인한 contentId(반려동물 정보 유무 무관)를 기록해, 재실행 시 같은 곳을 또 조회하지 않게 합니다. */
const checkedIdsPath = resolve(ROOT, "scripts/.tour-checked-ids.json");

function save(places: Map<string, Place>) {
  const arr = Array.from(places.values());
  writeFileSync(outPath, JSON.stringify(arr, null, 2) + "\n", "utf-8");
  return arr;
}

function loadExistingPlaces(): Map<string, Place> {
  try {
    const arr = JSON.parse(readFileSync(outPath, "utf-8")) as Place[];
    return new Map(arr.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
}

function loadCheckedIds(): Set<string> {
  try {
    return new Set(JSON.parse(readFileSync(checkedIdsPath, "utf-8")) as string[]);
  } catch {
    return new Set();
  }
}

function saveCheckedIds(ids: Set<string>) {
  writeFileSync(checkedIdsPath, JSON.stringify(Array.from(ids)), "utf-8");
}

async function main() {
  const places = loadExistingPlaces();
  const checkedIds = loadCheckedIds();
  let quotaExceeded = false;

  outer: for (const gu of SEOUL_GU) {
    console.log(`[${gu.name}] 관광정보 조회 중...`);
    let guHitCount = 0;

    for (const plan of CONTENT_TYPE_PLAN) {
      let candidates: AreaBasedItem[];
      try {
        candidates = await fetchAreaBasedList(gu.code, plan.contentTypeId, plan.numOfRows);
      } catch (err) {
        if (err instanceof QuotaExceededError) {
          console.error(`  쿼터 초과로 중단합니다: ${err.message}`);
          quotaExceeded = true;
          break outer;
        }
        throw err;
      }
      await sleep(150);

      for (const candidate of candidates.slice(0, plan.checkLimit)) {
        const category = mapCategory(candidate.contenttypeid, candidate.title);
        if (!category) continue;
        if (checkedIds.has(candidate.contentid)) continue;

        let pet: DetailPetTourItem | null;
        try {
          pet = await fetchPetTour(candidate.contentid);
        } catch (err) {
          if (err instanceof QuotaExceededError) {
            console.error(`  쿼터 초과로 중단합니다: ${err.message}`);
            quotaExceeded = true;
            break outer;
          }
          throw err;
        }
        checkedIds.add(candidate.contentid);
        await sleep(120);
        if (!pet) continue;

        const detail = await fetchDetailCommon(candidate.contentid);
        await sleep(120);
        if (!detail) continue;

        const lat = Number(detail.mapy);
        const lng = Number(detail.mapx);
        if (!lat || !lng) continue;

        places.set(`tourapi-${candidate.contentid}`, {
          id: `tourapi-${candidate.contentid}`,
          name: detail.title,
          category,
          gu: gu.slug,
          guName: gu.name,
          address: [detail.addr1, detail.addr2].filter(Boolean).join(" "),
          lat,
          lng,
          description: truncateDescription(detail.overview || detail.title),
          petPolicy: {
            indoor: /실내|전구역/.test(pet.acmpyTypeCd ?? ""),
            leashRequired: true,
            notes: buildPetPolicyNotes(pet) || undefined,
          },
          source: "tourapi",
        });
        guHitCount++;
      }
    }

    console.log(`  → ${guHitCount}건 반려동물 동반 장소 확보 (누적 ${places.size}건)`);
    save(places); // 구 단위로 저장해 중간에 쿼터가 소진돼도 진행분을 잃지 않습니다.
    saveCheckedIds(checkedIds);
  }

  const arr = save(places);
  saveCheckedIds(checkedIds);
  console.log(
    quotaExceeded
      ? `\n쿼터 초과로 중간에 멈췄습니다. 현재까지 총 ${arr.length}건을 ${outPath}에 저장했습니다. 쿼터가 초기화된 뒤 다시 실행하면 이어서 채울 수 있습니다.`
      : `\n완료: 총 ${arr.length}건을 ${outPath}에 저장했습니다.`,
  );

  const byGu = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const p of arr) {
    byGu.set(p.guName, (byGu.get(p.guName) ?? 0) + 1);
    byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
  }
  console.log("\n카테고리별 건수:", Object.fromEntries(byCategory));
  console.log("\n구별 건수:");
  for (const gu of SEOUL_GU) {
    console.log(`  ${gu.name}: ${byGu.get(gu.name) ?? 0}건`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
