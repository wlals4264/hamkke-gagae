import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/** 현재 로그인한 사용자의 세션 정보를 반환합니다 (본인 것만). */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
