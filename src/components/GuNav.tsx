"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GU_LIST } from "@/lib/places";

interface GuNavProps {
  /** 현재 선택된 구 slug. 없으면 "서울 전체"가 활성 상태로 표시됨 */
  activeGu?: string;
}

function chipClass(active: boolean) {
  return `whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
    active ? "border-ink bg-ink text-white shadow-sm" : "border-ink/10 bg-white text-muted hover:border-brand-500/50 hover:text-ink"
  }`;
}

/**
 * 구 목록이 26개(전체 포함)라 한 화면에 다 안 들어와서 가로 스크롤로 처리하는데,
 * macOS 등 기본 스크롤바가 숨겨지는 환경에서는 스크롤이 되는지 자체를 알아채기 어렵습니다.
 * 그래서 넘칠 때 양쪽에 페이드 + 화살표 버튼을 띄워 "더 있다"는 걸 시각적으로 알려줍니다.
 */
export default function GuNav({ activeGu }: GuNavProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <nav ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1" aria-label="구 선택">
        <Link href="/seoul" className={chipClass(!activeGu)}>
          서울 전체
        </Link>
        {GU_LIST.map((gu) => (
          <Link key={gu.slug} href={`/seoul/${gu.slug}`} className={chipClass(activeGu === gu.slug)}>
            {gu.name}
          </Link>
        ))}
      </nav>

      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-cream to-transparent" />
          <button
            type="button"
            onClick={() => scrollByAmount(-240)}
            aria-label="구 목록 왼쪽으로 스크롤"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 grid h-7 w-7 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm"
          >
            ‹
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-cream to-transparent" />
          <button
            type="button"
            onClick={() => scrollByAmount(240)}
            aria-label="구 목록 오른쪽으로 스크롤"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 grid h-7 w-7 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
