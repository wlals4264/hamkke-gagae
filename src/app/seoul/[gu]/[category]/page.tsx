import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuNav from "@/components/GuNav";
import PlaceExplorer from "@/components/PlaceExplorer";
import { getGuBySlug, getCategoryBySlug, getPlacesByGuAndCategory } from "@/lib/places";

// 제보 승인분이 바로 반영돼야 해서 정적 생성 대신 매 요청 렌더링
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ gu: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gu: guSlug, category: categorySlug } = await params;
  const gu = getGuBySlug(guSlug);
  const category = getCategoryBySlug(categorySlug);
  if (!gu || !category) return {};

  return {
    title: `${gu.name} 반려동물 동반 ${category.name}`,
    description: `${gu.name}에서 반려동물과 함께 갈 수 있는 ${category.name} 목록이에요.`,
  };
}

export default async function GuCategoryPage({ params }: PageProps) {
  const { gu: guSlug, category: categorySlug } = await params;
  const gu = getGuBySlug(guSlug);
  const category = getCategoryBySlug(categorySlug);
  if (!gu || !category) notFound();

  const places = await getPlacesByGuAndCategory(guSlug, categorySlug);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-brand-600">{category.emoji} {category.name.toUpperCase()}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">
          {gu.name}의 동반 가능 {category.name}
        </h1>
        <p className="mt-2 text-sm text-muted">함께 머물기 좋은 곳 {places.length}곳을 찾았어요.</p>
      </header>
      <GuNav activeGu={guSlug} />
      <PlaceExplorer places={places} activeGu={guSlug} activeCategory={category.slug} />
    </main>
  );
}
