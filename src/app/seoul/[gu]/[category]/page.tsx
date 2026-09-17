import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuNav from "@/components/GuNav";
import PlaceExplorer from "@/components/PlaceExplorer";
import {
  GU_LIST,
  CATEGORY_LIST,
  getGuBySlug,
  getCategoryBySlug,
  getPlacesByGuAndCategory,
} from "@/lib/places";

interface PageProps {
  params: Promise<{ gu: string; category: string }>;
}

/** 구 x 카테고리 모든 조합을 정적 페이지로 미리 생성 (SSG) */
export function generateStaticParams() {
  return GU_LIST.flatMap((gu) => CATEGORY_LIST.map((category) => ({ gu: gu.slug, category: category.slug })));
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

  const places = getPlacesByGuAndCategory(guSlug, categorySlug);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">
          {gu.name} 반려동물 동반 {category.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{places.length}곳을 찾았어요.</p>
      </header>
      <GuNav activeGu={guSlug} />
      <PlaceExplorer places={places} activeGu={guSlug} activeCategory={category.slug} />
    </main>
  );
}
