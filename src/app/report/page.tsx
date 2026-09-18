import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import ReportForm from "@/components/ReportForm";
import { buttonClass } from "@/lib/ui/button";

export const metadata: Metadata = {
  title: "장소 제보하기",
  description: "지도에 없는 반려동물 동반 장소를 직접 등록해주세요.",
};

export default async function ReportPage() {
  const session = await getSession();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-brand-600">REPORT</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">장소 제보하기</h1>
        <p className="mt-2 text-sm text-muted">
          지도에서 못 찾은 반려동물 동반 장소가 있다면 알려주세요. 운영자 확인 후 지도에 반영돼요.
        </p>
      </header>

      {session ? (
        <ReportForm />
      ) : (
        <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <p className="text-sm text-muted">제보는 로그인 후 이용할 수 있어요.</p>
          <a href="/api/auth/kakao/login?next=/report" className={buttonClass("kakao", "md", "mt-4 inline-block")}>
            카카오로 로그인
          </a>
        </div>
      )}
    </main>
  );
}
