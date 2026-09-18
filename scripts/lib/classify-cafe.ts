/**
 * 식약처/TourAPI 데이터는 업태·콘텐츠타입 기준으로만 분류되어 있어,
 * "일반음식점"으로 등록된 카페(예: 머치커피)가 restaurant로 잘못 분류되는 경우가 있습니다.
 * 이름에 카페/커피 관련 키워드가 있으면 cafe로 보정합니다.
 */
const CAFE_NAME_PATTERN = /카페|커피|coffee|cafe|로스터리|roastery|에스프레소|espresso/i;

export function looksLikeCafe(name: string): boolean {
  return CAFE_NAME_PATTERN.test(name);
}
