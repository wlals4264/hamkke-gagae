import { getSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { getPendingSubmissions, getReviewedSubmissions } from "@/lib/submissions";
import { CATEGORY_LIST } from "@/lib/catalog";
import AdminSubmissionActions from "@/components/AdminSubmissionActions";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminSubmissionsPage() {
  const session = await getSession();

  if (!isAdmin(session)) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16 text-center">
        <p className="text-lg font-bold text-ink">권한이 없어요</p>
        <p className="text-sm text-muted">관리자만 접근할 수 있는 페이지예요.</p>
      </main>
    );
  }

  const [pending, reviewed] = await Promise.all([getPendingSubmissions(), getReviewedSubmissions()]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-brand-600">ADMIN</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">제보 승인</h1>
      </header>

      <section>
        <h2 className="text-lg font-bold text-ink">대기 중 ({pending.length})</h2>
        <div className="mt-3 flex flex-col gap-3">
          {pending.length === 0 && <p className="text-sm text-muted">대기 중인 제보가 없어요.</p>}
          {pending.map((s) => {
            const category = CATEGORY_LIST.find((c) => c.slug === s.category);
            return (
              <div key={s.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">
                      {s.name} <span className="text-sm font-normal text-muted">{category?.emoji} {category?.name}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{s.address}</p>
                    {s.description && <p className="mt-2 text-sm text-ink">{s.description}</p>}
                    <p className="mt-2 text-xs text-muted">
                      실내동반 {s.pet_policy.indoor ? "가능" : "불가"} · 목줄{" "}
                      {s.pet_policy.leashRequired ? "필수" : "선택"}
                      {s.pet_policy.sizeLimit && ` · ${s.pet_policy.sizeLimit}`}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {s.nickname} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <AdminSubmissionActions id={s.id} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink">최근 처리 내역</h2>
        <div className="mt-3 flex flex-col divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
          {reviewed.length === 0 && <p className="p-4 text-sm text-muted">처리 내역이 없어요.</p>}
          {reviewed.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <span className="text-ink">{s.name}</span>
              <span className={s.status === "approved" ? "font-semibold text-sage-700" : "font-semibold text-red-700"}>
                {s.status === "approved" ? "승인됨" : "거절됨"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
