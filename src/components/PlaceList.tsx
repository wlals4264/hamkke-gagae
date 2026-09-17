import type { Place } from "@/types/place";
import PlaceCard from "./PlaceCard";

interface PlaceListProps {
  places: Place[];
  distances?: Record<string, number>;
}

export default function PlaceList({ places, distances }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/20 bg-white p-6 text-center text-sm text-ink/50">
        조건에 맞는 장소가 아직 없어요. 다른 구나 카테고리를 선택해보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} distanceKm={distances?.[place.id]} />
      ))}
    </div>
  );
}
