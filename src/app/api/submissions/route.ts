import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createSubmission } from "@/lib/submissions";
import { extractGuFromAddress, geocodeAddress } from "@/lib/kakao-geocode";
import { CATEGORY_LIST } from "@/lib/catalog";
import type { PlaceCategory } from "@/types/place";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { name, category, address, lat: clientLat, lng: clientLng, description, petPolicy } = (json ?? {}) as {
    name?: unknown;
    category?: unknown;
    address?: unknown;
    lat?: unknown;
    lng?: unknown;
    description?: unknown;
    petPolicy?: unknown;
  };

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
    return NextResponse.json({ error: "장소명은 1~100자여야 합니다." }, { status: 400 });
  }
  if (typeof category !== "string" || !CATEGORY_LIST.some((c) => c.slug === category)) {
    return NextResponse.json({ error: "카테고리가 올바르지 않습니다." }, { status: 400 });
  }
  if (typeof address !== "string" || address.trim().length === 0) {
    return NextResponse.json({ error: "주소를 입력해주세요." }, { status: 400 });
  }
  if (typeof description !== "string" || description.length > 500) {
    return NextResponse.json({ error: "설명은 500자 이하여야 합니다." }, { status: 400 });
  }
  const policy = (petPolicy ?? {}) as { indoor?: unknown; leashRequired?: unknown; sizeLimit?: unknown; notes?: unknown };
  if (typeof policy.indoor !== "boolean" || typeof policy.leashRequired !== "boolean") {
    return NextResponse.json({ error: "동반 조건을 확인해주세요." }, { status: 400 });
  }

  const gu = extractGuFromAddress(address);
  if (!gu) {
    return NextResponse.json(
      { error: "서울 지역 주소만 등록할 수 있어요. 도로명주소(예: 서울특별시 마포구 ...)로 입력해주세요." },
      { status: 400 },
    );
  }

  // 검색 결과에서 좌표를 이미 받아왔으면(장소 검색으로 선택한 경우) 그대로 쓰고,
  // 주소를 직접 입력한 경우에만 서버에서 지오코딩합니다.
  let coord: { lat: number; lng: number } | null =
    typeof clientLat === "number" && typeof clientLng === "number" ? { lat: clientLat, lng: clientLng } : null;

  if (!coord) {
    try {
      coord = await geocodeAddress(address);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "주소 확인에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
    }
  }
  if (!coord) {
    return NextResponse.json({ error: "주소를 찾을 수 없어요. 정확한 도로명주소로 다시 입력해주세요." }, { status: 400 });
  }

  try {
    const id = await createSubmission({
      kakaoId: session.kakaoId,
      nickname: session.nickname,
      name: name.trim(),
      category: category as PlaceCategory,
      gu: gu.slug,
      guName: gu.name,
      address: address.trim(),
      lat: coord.lat,
      lng: coord.lng,
      description: description.trim(),
      petPolicy: {
        indoor: policy.indoor,
        leashRequired: policy.leashRequired,
        sizeLimit: typeof policy.sizeLimit === "string" && policy.sizeLimit.trim() ? policy.sizeLimit.trim() : undefined,
        notes: typeof policy.notes === "string" && policy.notes.trim() ? policy.notes.trim() : undefined,
      },
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "제보 저장에 실패했습니다." }, { status: 500 });
  }
}
