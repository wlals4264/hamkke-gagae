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

/** 브랜드 토큰(brand-600 / cream) 기반 커스텀 핀 마커. 카카오 기본 파란 마커 대신 사용. */
const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
  <defs>
    <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="#3f3828" flood-opacity="0.4"/>
    </filter>
  </defs>
  <g filter="url(#pin-shadow)">
    <path d="M20 2C11.163 2 4 9.163 4 18c0 11.5 16 26 16 26s16-14.5 16-26C36 9.163 28.837 2 20 2z" fill="#885039"/>
    <circle cx="20" cy="18" r="6.5" fill="#ffeed6"/>
  </g>
</svg>`;
const MARKER_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MARKER_SVG)}`;
const MARKER_SIZE = { width: 40, height: 48 };
const MARKER_OFFSET = { x: 20, y: 44 };

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

    const markerImage = new window.kakao.maps.MarkerImage(
      MARKER_IMAGE_SRC,
      new window.kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height),
      { offset: new window.kakao.maps.Point(MARKER_OFFSET.x, MARKER_OFFSET.y) },
    );

    markersRef.current = places.map((place) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        map: mapRef.current!,
        image: markerImage,
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
        className={`paper-grid flex h-full w-full flex-col items-center justify-center gap-2 rounded-[20px] bg-sage-50 p-6 text-center text-sm text-muted ${className ?? ""}`}
      >
        <p className="font-bold text-ink">지도를 준비하고 있어요</p>
        <p>
          지금은 장소 목록에서 함께 갈 곳을 찾아보세요.
        </p>
        <p className="text-xs text-muted">
          지역과 카테고리 필터는 계속 이용할 수 있어요.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-700 ${className ?? ""}`}
      >
        지도를 불러오지 못했어요. 잠시 후 새로고침해주세요. 장소 목록은 계속 이용할 수 있어요.
      </div>
    );
  }

  return <div ref={containerRef} className={`h-full w-full rounded-xl ${className ?? ""}`} />;
}
