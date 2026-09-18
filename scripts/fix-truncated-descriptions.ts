/**
 * fetch-tour-data.ts가 원래 slice(0, 200)으로 소개글을 저장해 문장 중간에서 끊긴 경우가
 * 있었습니다(예: "카페 우리는 장애인의 사회 참여 확대를 "). truncateDescription으로 로직을
 * 고친 뒤, 이미 저장된 데이터는 원문(overview)이 남아있지 않아 TourAPI에서 다시 받아와야
 * 합니다. description.length >= 200(잘렸을 가능성)인 tourapi 출처 장소만 다시 조회해
 * 새 로직으로 재저장하는 1회성 스크립트입니다.
 *
 * 실행: npx tsx scripts/fix-truncated-descriptions.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place } from "../src/types/place";
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
    // .env.local이 없으면 무시
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOverview(contentId: string): Promise<string | null> {
  const url = new URL(`${END_POINT}/detailCommon2`);
  url.searchParams.set("serviceKey", TOUR_API_KEY!);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", MOBILE_APP);
  url.searchParams.set("_type", "json");
  url.searchParams.set("contentId", contentId);

  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text);
  const items = json?.response?.body?.items;
  if (!items || items === "") return null;
  return items.item?.[0]?.overview ?? null;
}

const outPath = resolve(ROOT, "src/data/places.json");

async function main() {
  const places = JSON.parse(readFileSync(outPath, "utf-8")) as Place[];
  const targets = places.filter((p) => p.source === "tourapi" && p.description.length >= 200);
  console.log(`잘렸을 가능성이 있는 소개글 ${targets.length}건`);

  let fixed = 0;
  for (const place of targets) {
    const contentId = place.id.replace(/^tourapi-/, "");
    let overview: string | null;
    try {
      overview = await fetchOverview(contentId);
    } catch (err) {
      console.error(`  오류: ${place.name} - ${err}`);
      continue;
    }
    await sleep(150);

    if (!overview) {
      console.log(`  ${place.name}: overview 없음, 건드리지 않음`);
      continue;
    }

    const next = truncateDescription(overview);
    console.log(`  ${place.name}: ${place.description.length}자 -> ${next.length}자`);
    place.description = next;
    fixed++;
  }

  writeFileSync(outPath, JSON.stringify(places, null, 2) + "\n", "utf-8");
  console.log(`\n완료: ${fixed}건의 소개글을 다시 받아와 재저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
