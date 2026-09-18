import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const OAUTH_STATE_COOKIE = "kkori_oauth_state";

/** 카카오 로그인 시작: 인가 URL로 리다이렉트합니다. */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const clientId = process.env.KAKAO_LOGIN_REST_API_KEY;
  if (!clientId) {
    return NextResponse.redirect(`${origin}/?login_error=missing_config`);
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/kakao/callback`;

  const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "profile_nickname profile_image");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set(OAUTH_STATE_COOKIE, `${state}::${next}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
