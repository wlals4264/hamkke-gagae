import type { Metadata } from "next";
import GuNav from "@/components/GuNav";
import PlaceExplorer from "@/components/PlaceExplorer";
import { getAllPlaces } from "@/lib/places";

export const metadata: Metadata = {
  title: "서울 전체 반려동물 동반 장소 지도",
  description: "서울 전역의 반려동물 동반 가능한 카페, 식당, 공원, 쇼핑몰을 한눈에 찾아보세요.",
};

export default function SeoulPage() {
  const places = getAllPlaces();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold tracking-[0.14em] text-brand-600">EXPLORE SEOUL</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">함께 갈 곳을 찾아보세요</h1>
        <p className="mt-2 text-sm text-ink/55">
          구를 선택하거나, 카테고리로 필터링하거나, 내 주변 장소를 바로 확인해보세요.
        </p></div><span className="rounded-full bg-sage-100 px-3 py-1.5 text-xs font-bold text-sage-700">서울 전체 · {places.length}곳</span>
      </header>
      <GuNav />
      <PlaceExplorer places={places} />
    </main>
  );
}
