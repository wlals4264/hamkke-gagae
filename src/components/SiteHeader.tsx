import Link from "next/link";
import BrandMark from "./BrandMark";
import AuthButton from "./AuthButton";

export default function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span
            className="rounded-full bg-sage-100 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-sage-700"
            title="현재 서울 지역만 지원하는 베타 버전입니다"
          >
            BETA · 서울 한정
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm font-semibold" aria-label="주요 메뉴">
          <Link href="/seoul" className="rounded-full bg-ink px-4 py-2 text-white shadow-sm transition hover:bg-sage-700">
            장소 탐색
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
