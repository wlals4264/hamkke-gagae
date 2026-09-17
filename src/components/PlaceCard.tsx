import Link from "next/link";
import type { Place } from "@/types/place";
import { CATEGORY_LIST } from "@/lib/places";

interface PlaceCardProps {
  place: Place;
  distanceKm?: number;
}

export default function PlaceCard({ place, distanceKm }: PlaceCardProps) {
  const category = CATEGORY_LIST.find((c) => c.slug === place.category);

  return (
    <Link
      href={`/places/${place.id}`}
      className="hover-lift group block rounded-2xl border border-ink/10 bg-white p-5 shadow-sm hover:border-brand-500/40 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-ink group-hover:text-brand-700">{place.name}</h3>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
          {category ? `${category.emoji} ${category.name}` : place.category}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink/45">{place.address}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/65">{place.description}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-xs">
        {place.petPolicy.indoor && (
          <span className="rounded-md bg-sage-50 px-2 py-1 text-sage-700">✓ 실내 동반</span>
        )}
        {!place.petPolicy.indoor && (
          <span className="rounded-md bg-cream px-2 py-1 text-ink/60">실외/일부 구역</span>
        )}
        {place.petPolicy.sizeLimit && (
          <span className="rounded-md bg-cream px-2 py-1 text-ink/60">
            {place.petPolicy.sizeLimit}
          </span>
        )}
        {typeof distanceKm === "number" && (
          <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
            내 위치에서 {distanceKm.toFixed(1)}km
          </span>
        )}
      </div>
    </Link>
  );
}
