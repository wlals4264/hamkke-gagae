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
      className="block rounded-lg border border-neutral-200 p-4 transition hover:border-brand-500 hover:bg-brand-50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900">{place.name}</h3>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
          {category ? `${category.emoji} ${category.name}` : place.category}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{place.address}</p>
      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{place.description}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-xs">
        {place.petPolicy.indoor && (
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">실내 동반 가능</span>
        )}
        {!place.petPolicy.indoor && (
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">실외/일부 구역만</span>
        )}
        {place.petPolicy.sizeLimit && (
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">
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
