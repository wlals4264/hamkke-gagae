"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/types/place";
import type { KakaoMapInstance, KakaoMarkerInstance } from "@/types/kakao";

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

/** 카카오맵 SDK는 브라우저에 한 번만 로드하면 되므로 모듈 스코프에서 로딩 상태를 공유합니다. */
let sdkLoadingPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("kakao sdk load failed"));
    document.head.appendChild(script);
  });

  return sdkLoadingPromise;
}

interface KakaoMapProps {
  places: Place[];
  /** 지도 중심 좌표. 넘기지 않으면 서울시청 좌표를 기본값으로 사용 */
  center?: { lat: number; lng: number };
  level?: number;
  onMarkerClick?: (place: Place) => void;
  className?: string;
}

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };

export default function KakaoMap({
  places,
  center = SEOUL_CITY_HALL,
  level = 9,
  onMarkerClick,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<KakaoMarkerInstance[]>([]);
  const [status, setStatus] = useState<"idle" | "ready" | "error" | "missing-key">(
    KAKAO_APP_KEY ? "idle" : "missing-key",
  );

  // SDK 로드 + 지도 생성 (최초 1회)
  useEffect(() => {
    if (!KAKAO_APP_KEY || !containerRef.current) return;

    let cancelled = false;
    loadKakaoSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level,
        }) as KakaoMapInstance;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 중심 좌표 / 줌 레벨 갱신
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    mapRef.current.setLevel(level);
  }, [status, center.lat, center.lng, level]);

  // 마커 갱신
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));

    markersRef.current = places.map((place) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        map: mapRef.current!,
      }) as KakaoMarkerInstance;

      if (onMarkerClick) {
        window.kakao.maps.event.addListener(marker, "click", () => onMarkerClick(place));
      }

      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, places]);

  if (status === "missing-key") {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500 ${className ?? ""}`}
      >
        <p className="font-medium text-neutral-700">카카오맵 API 키가 설정되지 않았어요</p>
        <p>
          카카오 개발자센터(developers.kakao.com)에서 JavaScript 키를 발급받아{" "}
          <code className="rounded bg-neutral-200 px-1 py-0.5">.env.local</code>의{" "}
          <code className="rounded bg-neutral-200 px-1 py-0.5">NEXT_PUBLIC_KAKAO_MAP_KEY</code>에
          넣어주세요.
        </p>
        <p className="text-xs text-neutral-400">
          지금은 지도 없이도 장소 목록과 필터 UI는 정상 작동합니다.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-500 ${className ?? ""}`}
      >
        카카오맵 SDK를 불러오지 못했어요. API 키와 [플랫폼 &gt; Web] 도메인 등록 여부를 확인해주세요.
      </div>
    );
  }

  return <div ref={containerRef} className={`h-full w-full rounded-xl ${className ?? ""}`} />;
}
