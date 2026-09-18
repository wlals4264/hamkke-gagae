import { createClient } from "@supabase/supabase-js";

/**
 * 서버(라우트 핸들러)에서만 쓰는 service_role 클라이언트. RLS를 우회하므로
 * 절대 브라우저로 넘기지 말고, 요청을 처리하는 라우트 핸들러 안에서만 사용합니다.
 * 로그인은 Supabase Auth가 아니라 자체 카카오 OAuth(src/lib/auth)로 처리하므로
 * 쿠키 기반 세션 클라이언트는 두지 않습니다.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
