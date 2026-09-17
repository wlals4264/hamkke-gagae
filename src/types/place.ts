export type PlaceCategory = "cafe" | "restaurant" | "park" | "mall";

export interface PetPolicy {
  /** 실내 동반 가능 여부 */
  indoor: boolean;
  /** 목줄 필수 여부 */
  leashRequired: boolean;
  /** 크기 제한 등 추가 조건 (예: "소형견만 가능") */
  sizeLimit?: string;
  /** 기타 참고사항 */
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  /** 구 slug (예: "mapo") - URL 라우팅에 사용 */
  gu: string;
  /** 구 한글명 (예: "마포구") - 화면 표시에 사용 */
  guName: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  petPolicy: PetPolicy;
  /** 데이터 출처 표기용 (mock | tourapi 등) */
  source: string;
}
