import Link from "next/link";
import { PawMark } from "@/components/BrandMark";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-ink/10">
        <div className="paper-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid min-h-[670px] max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.03fr_.97fr] lg:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> BETA · 서울 한정 반려생활 로컬 가이드
            </span>
            <h1 className="mt-7 text-balance text-[46px] font-bold leading-[1.08] tracking-[-0.06em] text-ink sm:text-6xl">
              오늘은 어디까지<br />함께 <span className="text-brand-600">갈까?</span>
            </h1>
            <p className="mt-6 max-w-lg text-balance text-base leading-7 text-muted sm:text-lg">
              {BRAND_TAGLINE}. 서울의 카페, 식당, 공원을 동반 조건까지 꼼꼼하게 찾아보세요.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/seoul" className="rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-sage-700">
                장소 탐색 →
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-4 text-xs font-medium text-muted">
              <span>카페 · 맛집 · 공원 · 쇼핑</span><span className="h-3 w-px bg-ink/15" /><span>동반 조건 한눈에</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] py-8">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-brand-100" />
            <div className="absolute bottom-0 right-2 h-44 w-44 rounded-full bg-sage-100" />
            <div className="relative rotate-2 rounded-[34px] border border-ink/10 bg-white p-4 shadow-soft">
              <div className="relative h-[430px] overflow-hidden rounded-[25px] bg-sage-100 paper-grid">
                <div className="absolute left-[10%] top-[14%] h-3 w-[75%] rotate-[-14deg] rounded-full bg-white/90" />
                <div className="absolute left-[36%] top-0 h-[82%] w-3 rotate-[18deg] rounded-full bg-white/90" />
                <div className="absolute bottom-[22%] right-0 h-3 w-[72%] rotate-[8deg] rounded-full bg-white/90" />
                <div className="absolute left-[15%] top-[22%] rounded-2xl bg-white p-3 shadow-card"><PawMark className="h-10 w-10" /></div>
                <div className="absolute right-[13%] top-[37%] rounded-2xl bg-white p-3 shadow-card"><span className="text-2xl">☕</span></div>
                <div className="absolute bottom-[22%] left-[30%] rounded-2xl bg-white p-3 shadow-card"><span className="text-2xl">🌳</span></div>
                <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-ink p-5 text-white shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-bold text-brand-100">오늘의 산책 코스</p><p className="mt-1 text-lg font-bold">서울숲에서 커피까지</p></div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">1.2km</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-10 -rotate-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink shadow-card">✓ 실내 동반 가능</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-6">
        <p className="text-xs font-bold tracking-[0.16em] text-brand-600">WHY {BRAND_NAME}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink">검색보다 쉬운, 함께하는 외출</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["01", "조건까지 정확하게", "실내 동반, 목줄, 크기 제한처럼 방문 전에 꼭 필요한 정보를 모았어요."],
            ["02", "동네별로 가볍게", "서울 25개 구와 카테고리 필터로 오늘 갈 곳을 빠르게 좁혀보세요."],
            ["03", "가까운 곳부터", "현재 위치를 기준으로 반려동물과 가까이 갈 수 있는 장소를 보여드려요."],
          ].map(([num, title, desc]) => (
            <article key={num} className="hover-lift rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold text-brand-600">{num}</span><h3 className="mt-8 text-lg font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
