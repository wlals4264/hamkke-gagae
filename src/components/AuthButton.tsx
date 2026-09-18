import { getSession } from "@/lib/auth/session";

export default async function AuthButton() {
  const session = await getSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-muted sm:inline">{session.nickname}님</span>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-ink/35"
          >
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/kakao/login"
      className="rounded-full bg-[#FEE500] px-3 py-1.5 text-xs font-bold text-[#191919] shadow-sm transition hover:brightness-95"
    >
      카카오로 로그인
    </a>
  );
}
