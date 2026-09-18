import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { reviewSubmission } from "@/lib/submissions";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const { action, note } = json as { action?: unknown; note?: unknown };

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action은 approve 또는 reject여야 합니다." }, { status: 400 });
  }

  try {
    await reviewSubmission(id, action === "approve" ? "approved" : "rejected", typeof note === "string" ? note : undefined);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "처리에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
