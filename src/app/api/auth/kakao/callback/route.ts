import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";

const OAUTH_STATE_COOKIE = "kkori_oauth_state";

interface KakaoTokenResponse {
  access_token: string;
}

interface KakaoUserMe {
  id: number;
  properties?: { nickname?: string; profile_image?: string };
  kakao_account?: {
    profile?: { nickname?: string; profile_image_url?: string };
  };
}

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_LOGIN_REST_API_KEY!,
    redirect_uri: redirectUri,
    code,
  });
  if (process.env.KAKAO_CLIENT_SECRET) {
    body.set("client_secret", process.env.KAKAO_CLIENT_SECRET);
  }

  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });
  if (!res.ok) throw new Error(`카카오 토큰 교환 실패: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as KakaoTokenResponse;
  return json.access_token;
}

async function fetchKakaoUser(accessToken: string): Promise<KakaoUserMe> {
  const res = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`카카오 사용자 정보 조회 실패: ${res.status} ${await res.text()}`);
  return (await res.json()) as KakaoUserMe;
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const [expectedState, next] = savedState?.split("::") ?? [];

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return NextResponse.redirect(`${origin}/?login_error=state_mismatch`);
  }

  try {
    const redirectUri = `${origin}/api/auth/kakao/callback`;
    const accessToken = await exchangeCodeForToken(code, redirectUri);
    const kakaoUser = await fetchKakaoUser(accessToken);

    const nickname =
      kakaoUser.kakao_account?.profile?.nickname ?? kakaoUser.properties?.nickname ?? "회원";
    const profileImage =
      kakaoUser.kakao_account?.profile?.profile_image_url ?? kakaoUser.properties?.profile_image;

    const token = await createSessionToken({
      kakaoId: String(kakaoUser.id),
      nickname,
      profileImage,
    });

    const response = NextResponse.redirect(`${origin}${next || "/"}`);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch (err) {
    console.error("카카오 로그인 콜백 오류:", err);
    return NextResponse.redirect(`${origin}/?login_error=kakao_failed`);
  }
}
