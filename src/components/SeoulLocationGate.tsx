"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GU_LIST } from "@/lib/catalog";
import { loadKakaoSdk } from "@/lib/kakao";
import type { KakaoRegionResult } from "@/types/kakao";

const SESSION_KEY = "kkori-ttara-location-detected";
// 권한 프롬프트를 사용자가 오래 방치하는 경우를 대비한 안전장치. geolocation의 timeout
// 옵션만으로는 브라우저가 프롬프트 응답을 기다리는 동안 콜백이 아예 안 올 수 있음.
const FALLBACK_MS = 8000;

/**
 * "/seoul"(구 미선택) 진입 시 위치 기반 구 자동 감지가 끝날 때까지 자식(서울 전체 화면)을
 * 숨겨서, 감지 성공 시 "서울 전체 → 특정 구"로 화면이 통째로 바뀌는 부드럽지 않은 전환을 없앤다.
 * 감지에 실패/거부되거나 이미 이번 세션에 시도한 적 있으면 즉시 자식을 보여준다.
 */
export default function SeoulLocationGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.sessionStorage.getItem(SESSION_KEY)) {
      setReady(true);
      return;
    }

    if (!("geolocation" in navigator)) {
      setReady(true);
      return;
    }

    let settled = false;
    // 감지 실패/거부/타임아웃 시엔 세션 플래그를 세우지 않는다. 여기서 플래그를 찍으면
    // 다음 방문(같은 탭)에서 재시도할 기회 없이 계속 "서울 전체"만 보이게 된다.
    const reveal = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallback);
      setReady(true);
    };
    const fallback = window.setTimeout(reveal, FALLBACK_MS);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        loadKakaoSdk()
          .then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2RegionCode(
              coords.longitude,
              coords.latitude,
              (regions: KakaoRegionResult[], status: string) => {
                if (settled) return;
                const district =
                  status === "OK"
                    ? regions.find(
                        (region) =>
                          region.region_type === "H" &&
                          GU_LIST.some((gu) => gu.name === region.region_2depth_name),
                      )
                    : undefined;
                const gu = GU_LIST.find((item) => item.name === district?.region_2depth_name);
                if (gu) {
                  settled = true;
                  window.clearTimeout(fallback);
                  window.sessionStorage.setItem(SESSION_KEY, "true");
                  router.replace(`/seoul/${gu.slug}`);
                  return;
                }
                reveal();
              },
            );
          })
          .catch(() => reveal());
      },
      () => reveal(),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
    );

    return () => window.clearTimeout(fallback);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-col gap-6" aria-live="polite" aria-busy="true">
        <p className="text-sm font-medium text-muted">📍 현재 위치를 확인하고 있어요...</p>
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_.9fr]">
          <div className="h-[420px] animate-pulse rounded-3xl bg-white/70 md:h-[620px]" />
          <div className="h-[420px] animate-pulse rounded-3xl bg-white/70 md:h-[620px]" />
        </div>
      </div>
    );
  }

  return <div className="flex animate-fade-in flex-col gap-6">{children}</div>;
}
