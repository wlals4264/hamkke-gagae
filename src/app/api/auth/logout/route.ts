import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(origin, { status: 303 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
