/**
 * restaurant로 분류된 곳 중 실제로는 카페인 곳을 재분류합니다.
 *
 * 이름만 보고 LLM이 추측하면(예: "그로그(GROG)", "빌라레코드 바" 같은 이름은 카페인지 바인지
 * 술집인지 이름만으론 알 수 없음) 근거 없는 라벨이 나올 위험이 커서, 대신 카카오 로컬
 * 키워드 검색(이미 지오코딩에 쓰는 KAKAO_REST_API_KEY 재사용)으로 실제 업체 카테고리
 * (category_name, 예: "음식점 > 카페 > 커피전문점")를 조회해 근거 있는 경우만 보정합니다.
 * 이름/좌표가 일치하는 업체를 못 찾으면 건드리지 않고 그대로 둡니다.
 *
 * 실행: npx tsx scripts/reclassify-by-kakao-category.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place } from "../src/types/place";

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 이름 비교용 정규화: 영문 표기/괄호/공백/기호 제거 후 소문자화 */
function normalize(name: string): string {
  return name
    .replace(/\([^)]*\)/g, "")
    .replace(/[^가-힣a-zA-Z0-9]/g, "")
    .toLowerCase();
}

interface KakaoKeywordDoc {
  place_name: string;
  category_name: string;
}

async function findCategory(place: Place): Promise<string | null> {
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", place.name);
  url.searchParams.set("x", String(place.lng));
  url.searchParams.set("y", String(place.lat));
  url.searchParams.set("radius", "300");
  url.searchParams.set("sort", "distance");

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });
  if (!res.ok) throw new Error(`카카오 검색 실패 (${res.status}): ${place.name}`);

  const json = (await res.json()) as { documents: KakaoKeywordDoc[] };
  const target = normalize(place.name);
  const match = json.documents.find((d) => {
    const candidate = normalize(d.place_name);
    return candidate === target || candidate.includes(target) || target.includes(candidate);
  });
  return match ? match.category_name : null;
}

const outPath = resolve(ROOT, "src/data/places.json");

function save(places: Place[]) {
  writeFileSync(outPath, JSON.stringify(places, null, 2) + "\n", "utf-8");
}

async function main() {
  const places = JSON.parse(readFileSync(outPath, "utf-8")) as Place[];
  const targets = places.filter((p) => p.category === "restaurant");
  console.log(`검사 대상(restaurant) ${targets.length}건`);

  let changed = 0;
  let noMatch = 0;
  let errors = 0;

  for (const [i, place] of targets.entries()) {
    let categoryName: string | null = null;
    try {
      categoryName = await findCategory(place);
    } catch (err) {
      console.error(`  오류: ${place.name} - ${err}`);
      errors++;
      continue;
    }
    await sleep(100);

    if (!categoryName) {
      noMatch++;
      continue;
    }

    if (/카페|커피전문점|제과/.test(categoryName)) {
      console.log(`  [${i + 1}/${targets.length}] ${place.name} -> cafe (${categoryName})`);
      place.category = "cafe";
      changed++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  진행 ${i + 1}/${targets.length} (변경 ${changed}, 매칭실패 ${noMatch}, 오류 ${errors})`);
      save(places);
    }
  }

  save(places);
  console.log(
    `\n완료: ${changed}건을 restaurant -> cafe로 재분류. 매칭 실패 ${noMatch}건, 오류 ${errors}건 (그대로 유지).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
