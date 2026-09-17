import Link from "next/link";
import BrandMark from "./BrandMark";

export default function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandMark />
        <nav className="flex items-center gap-2 text-sm font-semibold" aria-label="주요 메뉴">
          <Link href="/seoul" className="rounded-full px-3 py-2 text-ink/70 hover:bg-white hover:text-ink">
            장소 탐색
          </Link>
          <Link href="/seoul" className="rounded-full bg-ink px-4 py-2 text-white shadow-sm transition hover:bg-sage-700">
            지도 보기
          </Link>
        </nav>
      </div>
    </header>
  );
}
