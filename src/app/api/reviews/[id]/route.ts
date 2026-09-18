import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteReview } from "@/lib/reviews";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteReview(id, session.kakaoId);
  if (!deleted) {
    return NextResponse.json({ error: "삭제할 후기를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
