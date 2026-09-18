import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { upsertReview } from "@/lib/reviews";
import { getPlaceById } from "@/lib/places";

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

  const { placeId, rating, body } = (json ?? {}) as {
    placeId?: unknown;
    rating?: unknown;
    body?: unknown;
  };

  if (typeof placeId !== "string" || !(await getPlaceById(placeId))) {
    return NextResponse.json({ error: "존재하지 않는 장소입니다." }, { status: 400 });
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "평점은 1~5 사이 정수여야 합니다." }, { status: 400 });
  }
  if (typeof body !== "string" || body.trim().length === 0 || body.length > 1000) {
    return NextResponse.json({ error: "후기 내용은 1~1000자여야 합니다." }, { status: 400 });
  }

  try {
    await upsertReview({
      placeId,
      kakaoId: session.kakaoId,
      nickname: session.nickname,
      rating,
      body: body.trim(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "후기 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
