import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "kkori_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30일

export interface SessionPayload {
  /** 카카오 사용자 고유 ID (문자열로 저장) */
  kakaoId: string;
  nickname: string;
  profileImage?: string;
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET이 설정되어 있지 않습니다. .env.local을 확인하세요.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.kakaoId !== "string" || typeof payload.nickname !== "string") return null;
    return {
      kakaoId: payload.kakaoId,
      nickname: payload.nickname,
      profileImage: typeof payload.profileImage === "string" ? payload.profileImage : undefined,
    };
  } catch {
    return null;
  }
}

/** 서버 컴포넌트/라우트 핸들러에서 현재 로그인 사용자를 읽습니다. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
