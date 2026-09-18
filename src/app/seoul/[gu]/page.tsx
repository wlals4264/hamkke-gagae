import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuNav from "@/components/GuNav";
import PlaceExplorer from "@/components/PlaceExplorer";
import { getGuBySlug, getPlacesByGu } from "@/lib/places";

// 제보 승인분이 바로 반영돼야 해서 정적 생성 대신 매 요청 렌더링
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ gu: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gu: guSlug } = await params;
  const gu = getGuBySlug(guSlug);
  if (!gu) return {};

  return {
    title: `${gu.name} 반려동물 동반 장소 지도`,
    description: `${gu.name}에서 반려동물과 함께 갈 수 있는 카페, 식당, 공원, 쇼핑몰을 모아봤어요.`,
  };
}

export default async function GuPage({ params }: PageProps) {
  const { gu: guSlug } = await params;
  const gu = getGuBySlug(guSlug);
  if (!gu) notFound();

  const places = await getPlacesByGu(guSlug);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-brand-600">EXPLORE SEOUL</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">{gu.name}에서 함께 갈 곳</h1>
        <p className="mt-2 text-sm text-muted">
          {gu.name}에서 반려동물과 함께 갈 수 있는 장소 {places.length}곳을 찾았어요.
        </p>
      </header>
      <GuNav activeGu={guSlug} />
      <PlaceExplorer places={places} activeGu={guSlug} />
    </main>
  );
}
