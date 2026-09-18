import { getSession } from "@/lib/auth/session";
import { buttonClass } from "@/lib/ui/button";

export default async function AuthButton() {
  const session = await getSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-muted sm:inline">{session.nickname}님</span>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className={buttonClass("secondary", "md")}>
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <a href="/api/auth/kakao/login" className={buttonClass("kakao", "md")}>
      카카오로 로그인
    </a>
  );
}
