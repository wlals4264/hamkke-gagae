/**
 * 카카오맵 JavaScript SDK 최소 타입 선언.
 * 공식 @types 패키지를 쓰지 않고, 이 프로젝트에서 실제로 사용하는 범위만 선언합니다.
 * SDK 전체 스펙은 https://apis.map.kakao.com/web/documentation/ 참고.
 */
export {};

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level?: number },
        ) => KakaoMapInstance;
        Marker: new (options: { position: unknown; map?: KakaoMapInstance }) => KakaoMarkerInstance;
        event: {
          addListener: (
            target: KakaoMarkerInstance | KakaoMapInstance,
            type: string,
            handler: () => void,
          ) => void;
        };
      };
    };
  }
}

export interface KakaoMapInstance {
  setCenter: (latlng: unknown) => void;
  setLevel: (level: number) => void;
  panTo: (latlng: unknown) => void;
}

export interface KakaoMarkerInstance {
  setMap: (map: KakaoMapInstance | null) => void;
}
