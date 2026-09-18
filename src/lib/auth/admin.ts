import type { SessionPayload } from "./session";

/** ADMIN_KAKAO_ID 환경변수에 등록된 카카오 ID인지 확인합니다. */
export function isAdmin(session: SessionPayload | null): boolean {
  const adminId = process.env.ADMIN_KAKAO_ID;
  return !!session && !!adminId && session.kakaoId === adminId;
}
