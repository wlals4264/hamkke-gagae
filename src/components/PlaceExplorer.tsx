"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Place, PlaceCategory } from "@/types/place";
import { CATEGORY_LIST } from "@/lib/places";
import { haversineDistanceKm } from "@/lib/geo";
import KakaoMap from "./KakaoMap";
import PlaceList from "./PlaceList";

interface PlaceExplorerProps {
  /** 서버에서 이미 구/카테고리 기준으로 필터링해 내려준 장소 목록 */
  places: Place[];
  /** 현재 라우트의 구 slug. 없으면 "서울 전체" 화면 */
  activeGu?: string;
  /** 현재 라우트의 카테고리 slug. 구+카테고리 라우트일 때만 존재 */
  activeCategory?: PlaceCategory;
}

type GeoStatus = "idle" | "loading" | "success" | "denied" | "unsupported";

export default function PlaceExplorer({ places, activeGu, activeCategory }: PlaceExplorerProps) {
  // "서울 전체"(구 미선택) 화면에서만 쓰는 클라이언트 사이드 카테고리 필터.
  // 구가 선택된 상태에서는 카테고리 전환이 /seoul/[gu]/[category] 라우트 이동으로 처리되므로 필요 없음.
  const [clientCategoryFilter, setClientCategoryFilter] = useState<PlaceCategory | "all">("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const categoryFiltered = useMemo(() => {
    if (activeGu) return places; // 이미 라우트에서 카테고리까지 필터링된 상태
    if (clientCategoryFilter === "all") return places;
    return places.filter((p) => p.category === clientCategoryFilter);
  }, [places, activeGu, clientCategoryFilter]);

  const distances = useMemo(() => {
    if (!userLocation) return undefined;
    const map: Record<string, number> = {};
    categoryFiltered.forEach((p) => {
      map[p.id] = haversineDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng);
    });
    return map;
  }, [categoryFiltered, userLocation]);

  const sortedPlaces = useMemo(() => {
    if (!distances) return categoryFiltered;
    return [...categoryFiltered].sort((a, b) => distances[a.id] - distances[b.id]);
  }, [categoryFiltered, distances]);

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (sortedPlaces.length > 0) {
      const avgLat = sortedPlaces.reduce((sum, p) => sum + p.lat, 0) / sortedPlaces.length;
      const avgLng = sortedPlaces.reduce((sum, p) => sum + p.lng, 0) / sortedPlaces.length;
      return { lat: avgLat, lng: avgLng };
    }
    return undefined;
  }, [userLocation, sortedPlaces]);

  function handleFindMe() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("success");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white p-3 shadow-sm">
        {activeGu ? (
          <>
            <Link
              href={`/seoul/${activeGu}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                !activeCategory
                  ? "bg-ink text-white"
                  : "bg-cream text-ink/65 hover:bg-brand-50"
              }`}
            >
              전체
            </Link>
            {CATEGORY_LIST.map((cat) => (
              <Link
                key={cat.slug}
                href={`/seoul/${activeGu}/${cat.slug}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  activeCategory === cat.slug
                    ? "bg-ink text-white"
                    : "bg-cream text-ink/65 hover:bg-brand-50"
                }`}
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setClientCategoryFilter("all")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                clientCategoryFilter === "all"
                  ? "bg-ink text-white"
                  : "bg-cream text-ink/65 hover:bg-brand-50"
              }`}
            >
              전체
            </button>
            {CATEGORY_LIST.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setClientCategoryFilter(cat.slug)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  clientCategoryFilter === cat.slug
                    ? "bg-ink text-white"
                    : "bg-cream text-ink/65 hover:bg-brand-50"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </>
        )}

        <button
          type="button"
          onClick={handleFindMe}
          className="ml-auto rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
        >
          {geoStatus === "loading" ? "위치 확인 중..." : "📍 내 주변 보기"}
        </button>
      </div>

      {geoStatus === "denied" && (
        <p className="text-sm text-red-500">
          위치 권한이 거부됐어요. 브라우저 설정에서 위치 접근을 허용하거나, 구를 직접 선택해주세요.
        </p>
      )}
      {geoStatus === "unsupported" && (
        <p className="text-sm text-red-500">이 브라우저에서는 위치 정보 기능을 사용할 수 없어요.</p>
      )}
      {geoStatus === "success" && (
        <p className="text-sm text-brand-700">현재 위치 기준으로 가까운 순서대로 정렬했어요.</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_.9fr]">
        <div className="h-[420px] overflow-hidden rounded-3xl border border-ink/10 bg-white p-1.5 shadow-card md:h-[620px]">
          <KakaoMap places={sortedPlaces} center={mapCenter} />
        </div>
        <div className="max-h-[620px] overflow-y-auto pr-1">
          <PlaceList places={sortedPlaces} distances={distances} />
        </div>
      </div>
    </div>
  );
}
