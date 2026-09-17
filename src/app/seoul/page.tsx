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
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">서울 반려동물 동반 지도</h1>
        <p className="mt-1 text-sm text-neutral-500">
          구를 선택하거나, 카테고리로 필터링하거나, 내 주변 장소를 바로 확인해보세요.
        </p>
      </header>
      <GuNav />
      <PlaceExplorer places={places} />
    </main>
  );
}
