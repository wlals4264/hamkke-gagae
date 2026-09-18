import Link from "next/link";
import { GU_LIST } from "@/lib/places";

interface GuNavProps {
  activeGu?: string;
}

const districts = [...GU_LIST].sort((a, b) => a.name.localeCompare(b.name, "ko"));

export default function GuNav({ activeGu }: GuNavProps) {
  const selectedName = GU_LIST.find((gu) => gu.slug === activeGu)?.name ?? "서울 전체";

  return (
    <details key={activeGu ?? "all"} className="group rounded-2xl border border-ink/10 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </span>
          <span>
            <span className="block text-xs font-medium text-muted">탐색 지역</span>
            <span className="mt-0.5 block text-base font-bold text-ink">{selectedName}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-sage-700">
          <span className="group-open:hidden">지역 변경</span>
          <span className="hidden group-open:inline">접기</span>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <nav className="border-t border-ink/10 p-4 sm:p-5" aria-label="탐색 지역 선택">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/seoul" aria-current={!activeGu ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${!activeGu ? "bg-ink text-white" : "bg-cream text-ink hover:bg-sage-100"}`}>
            서울 전체{!activeGu && <span className="ml-2" aria-hidden="true">✓</span>}
          </Link>
          <span className="text-xs text-muted">25개 구 · 가나다순</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {districts.map((gu) => (
            <Link
              key={gu.slug}
              href={`/seoul/${gu.slug}`}
              aria-current={activeGu === gu.slug ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center gap-1 rounded-xl px-2 py-3 text-sm font-medium transition ${activeGu === gu.slug ? "bg-ink text-white" : "bg-cream/50 text-ink hover:bg-sage-100"}`}
            >
              {gu.name}{activeGu === gu.slug && <span aria-hidden="true">✓</span>}
            </Link>
          ))}
        </div>
      </nav>
    </details>
  );
}
