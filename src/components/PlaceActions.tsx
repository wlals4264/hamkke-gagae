"use client";

import { useRef, useState } from "react";
import type { Place } from "@/types/place";
import Snackbar from "./Snackbar";

interface PlaceActionsProps {
  place: Place;
}

/** 카카오맵 공식 링크 공유 URL 스킴 (API 키 불필요). https://map.kakao.com/link/... */
function kakaoMapUrl(place: Place) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
}

function kakaoRouteUrl(place: Place) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
}

export default function PlaceActions({ place }: PlaceActionsProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(kakaoMapUrl(place));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToastVisible(true);
      timeoutRef.current = setTimeout(() => setToastVisible(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경 - 조용히 무시
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <a
          href={kakaoRouteUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sage-700"
        >
          🧭 길찾기
        </a>
        <a
          href={kakaoMapUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ink/35"
        >
          🗺️ 카카오맵에서 보기
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-ink/35"
        >
          🔗 지도 공유하기
        </button>
      </div>

      <Snackbar message="링크가 복사되었습니다" visible={toastVisible} />
    </>
  );
}
