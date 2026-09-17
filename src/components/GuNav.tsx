import Link from "next/link";
import { GU_LIST } from "@/lib/places";

interface GuNavProps {
  /** 현재 선택된 구 slug. 없으면 "서울 전체"가 활성 상태로 표시됨 */
  activeGu?: string;
}

function chipClass(active: boolean) {
  return `whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
    active ? "border-ink bg-ink text-white shadow-sm" : "border-ink/10 bg-white text-ink/65 hover:border-brand-500/50 hover:text-ink"
  }`;
}

export default function GuNav({ activeGu }: GuNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="구 선택">
      <Link href="/seoul" className={chipClass(!activeGu)}>
        서울 전체
      </Link>
      {GU_LIST.map((gu) => (
        <Link key={gu.slug} href={`/seoul/${gu.slug}`} className={chipClass(activeGu === gu.slug)}>
          {gu.name}
        </Link>
      ))}
    </nav>
  );
}
