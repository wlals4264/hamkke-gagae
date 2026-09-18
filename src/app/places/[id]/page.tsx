import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KakaoMap from "@/components/KakaoMap";
import PlaceActions from "@/components/PlaceActions";
import CopyButton from "@/components/CopyButton";
import ReviewSection from "@/components/ReviewSection";
import { CATEGORY_LIST, getPlaceById, getNearbyPlaces } from "@/lib/places";

// 후기가 실시간으로 반영돼야 해서(작성 후 router.refresh()로 바로 보임) 이 페이지는
// 정적 생성 대신 매 요청마다 렌더링합니다.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);
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
  const place = await getPlaceById(id);
  if (!place) notFound();

  const category = CATEGORY_LIST.find((c) => c.slug === place.category);
  const nearby = await getNearbyPlaces(place);

  const checklistItems = [
    {
      label: "실내 동반",
      value: place.petPolicy.indoor ? "가능" : "불가 또는 일부 구역만 가능",
      icon: place.petPolicy.indoor ? "🏠" : "🚪",
    },
    {
      label: "목줄",
      value: place.petPolicy.leashRequired ? "필수" : "지정 구역 내 해제 가능",
      icon: "🦮",
    },
    ...(place.petPolicy.sizeLimit
      ? [{ label: "크기 제한", value: place.petPolicy.sizeLimit, icon: "📏" }]
      : []),
    ...(place.petPolicy.notes ? [{ label: "참고", value: place.petPolicy.notes, icon: "📝" }] : []),
  ];

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

      <nav className="text-sm font-medium text-muted">
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
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink">{place.name}</h1>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            {category ? `${category.emoji} ${category.name}` : place.category}
          </span>
          {place.source === "petkorea" && (
            <span className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-bold text-sage-700">
              🛡️ 식약처 인증
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <p className="text-sm text-muted">{place.address}</p>
          <CopyButton value={place.address} label="주소 복사" toastMessage="주소가 복사되었습니다" />
        </div>
        <div className="mt-4">
          <PlaceActions place={place} />
        </div>
      </header>

      <div className="h-[320px] overflow-hidden rounded-3xl border border-ink/10 bg-white p-1.5 shadow-card">
        <KakaoMap places={[place]} center={{ lat: place.lat, lng: place.lng }} level={4} />
      </div>

      <section className="rounded-3xl border border-ink/10 bg-white p-6">
        <h2 className="text-lg font-bold text-ink">어떤 곳인가요?</h2>
        <p className="mt-2 leading-7 text-muted">{place.description}</p>
      </section>

      <section className="rounded-3xl bg-sage-50 p-6">
        <h2 className="text-lg font-bold text-ink">함께 가기 전 체크</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {checklistItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-base">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">{item.label}</p>
                <p className="text-sm font-bold leading-5 text-ink">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReviewSection placeId={place.id} />

      {nearby.length > 0 && (
        <section className="rounded-3xl border border-ink/10 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">{place.guName}의 다른 장소</h2>
          <div className="mt-2 flex flex-col divide-y divide-ink/5">
            {nearby.map((p) => {
              const nearbyCategory = CATEGORY_LIST.find((c) => c.slug === p.category);
              return (
                <Link
                  key={p.id}
                  href={`/places/${p.id}`}
                  className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-base">
                      {nearbyCategory?.emoji ?? "📍"}
                    </span>
                    <span className="truncate font-semibold text-ink group-hover:text-brand-700">
                      {p.name}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 shrink-0 text-muted transition group-hover:text-brand-700"
                    aria-hidden="true"
                  >
                    <path
                      d="m9 6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-xs text-muted">
        ⚠️ 이 페이지의 정보는 개발용 샘플 데이터입니다. 실제 방문 전 운영 여부와 반려동물 동반
        조건을 다시 확인해주세요.
      </p>
    </main>
  );
}
