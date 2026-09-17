import Link from "next/link";
import { GU_LIST } from "@/lib/places";

interface GuNavProps {
  /** 현재 선택된 구 slug. 없으면 "서울 전체"가 활성 상태로 표시됨 */
  activeGu?: string;
}

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
  }`;
}

export default function GuNav({ activeGu }: GuNavProps) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="구 선택">
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
