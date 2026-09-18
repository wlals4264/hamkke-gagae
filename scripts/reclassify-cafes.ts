/**
 * src/data/places.json에서 이름에 카페/커피 키워드가 있는데 restaurant로 분류된 곳을
 * cafe로 재분류합니다. fetch 스크립트의 분류 로직을 바꾼 뒤, 이미 생성된 데이터에도
 * 같은 규칙을 적용하기 위한 1회성 스크립트입니다.
 *
 * 실행: npx tsx scripts/reclassify-cafes.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Place } from "../src/types/place";
import { looksLikeCafe } from "./lib/classify-cafe";

const outPath = resolve(__dirname, "..", "src/data/places.json");
const places = JSON.parse(readFileSync(outPath, "utf-8")) as Place[];

let changed = 0;
for (const place of places) {
  if (place.category === "restaurant" && looksLikeCafe(place.name)) {
    console.log(`- ${place.name}`);
    place.category = "cafe";
    changed++;
  }
}

writeFileSync(outPath, JSON.stringify(places, null, 2) + "\n", "utf-8");
console.log(`\n${changed}건을 restaurant -> cafe로 재분류했습니다.`);
