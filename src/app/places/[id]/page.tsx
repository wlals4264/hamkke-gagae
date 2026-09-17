import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KakaoMap from "@/components/KakaoMap";
import { CATEGORY_LIST, getAllPlaces, getPlaceById, getNearbyPlaces } from "@/lib/places";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAllPlaces().map((place) => ({ id: place.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const place = getPlaceById(id);
  if (!place) return {};

  return {
    title: place.name,
    description: place.description,
    openGraph: {
      title: place.name,
      description: place.description,
      type: "website",
    },
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const place = getPlaceById(id);
  if (!place) notFound();

  const category = CATEGORY_LIST.find((c) => c.slug === place.category);
  const nearby = getNearbyPlaces(place);

  // 검색엔진이 "반려동물 동반 가능 장소"라는 것을 명확히 인식하도록 구조화 데이터를 심어둡니다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: place.name,
    description: place.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: place.guName,
      addressRegion: "서울특별시",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.lat,
      longitude: place.lng,
    },
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: "반려동물 동반 가능",
      value: true,
    },
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-7 px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm font-medium text-ink/45">
        <Link href="/seoul" className="hover:underline">
          서울 전체
        </Link>
        {" / "}
        <Link href={`/seoul/${place.gu}`} className="hover:underline">
          {place.guName}
        </Link>
        {" / "}
        <Link href={`/seoul/${place.gu}/${place.category}`} className="hover:underline">
          {category?.name ?? place.category}
        </Link>
      </nav>

      <header className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink">{place.name}</h1>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            {category ? `${category.emoji} ${category.name}` : place.category}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/50">{place.address}</p>
      </header>

      <div className="h-[320px] overflow-hidden rounded-3xl border border-ink/10 bg-white p-1.5 shadow-card">
        <KakaoMap places={[place]} center={{ lat: place.lat, lng: place.lng }} level={4} />
      </div>

      <section className="rounded-3xl border border-ink/10 bg-white p-6">
        <h2 className="text-lg font-bold text-ink">어떤 곳인가요?</h2>
        <p className="mt-2 leading-7 text-ink/65">{place.description}</p>
      </section>

      <section className="rounded-3xl bg-sage-50 p-6">
        <h2 className="text-lg font-bold text-ink">함께 가기 전 체크</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
          <li>실내 동반: {place.petPolicy.indoor ? "가능" : "불가 또는 일부 구역만 가능"}</li>
          <li>목줄: {place.petPolicy.leashRequired ? "필수" : "지정 구역 내 해제 가능"}</li>
          {place.petPolicy.sizeLimit && <li>크기 제한: {place.petPolicy.sizeLimit}</li>}
          {place.petPolicy.notes && <li>참고: {place.petPolicy.notes}</li>}
        </ul>
      </section>

      {nearby.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">{place.guName}의 다른 장소</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {nearby.map((p) => (
              <li key={p.id}>
                <Link href={`/places/${p.id}`} className="text-brand-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-neutral-400">
        ⚠️ 이 페이지의 정보는 개발용 샘플 데이터입니다. 실제 방문 전 운영 여부와 반려동물 동반
        조건을 다시 확인해주세요.
      </p>
    </main>
  );
}
