const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

let sdkLoadingPromise: Promise<void> | null = null;

/** 카카오맵 SDK를 브라우저에서 한 번만 로드합니다. 역지오코딩에 필요한 services 라이브러리도 함께 불러옵니다. */
export function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps?.services) return Promise.resolve();
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    if (!KAKAO_APP_KEY) {
      reject(new Error("Kakao map key is missing"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("kakao sdk load failed"));
    document.head.appendChild(script);
  });

  return sdkLoadingPromise;
}
