/**
 * 버튼(pill) 스타일 토큰. <button>/<a>/<Link>/<form> 등 실제 태그는 그대로 쓰고,
 * className만 이 함수로 통일해서 앱 전체 버튼 크기·색을 한곳에서 관리합니다.
 */
const SIZE = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-sm",
} as const;

const VARIANT = {
  /** 가장 강조되는 행동. Ink 배경 + 흰색 텍스트. */
  primary: "bg-ink text-white shadow-sm hover:bg-sage-700",
  /** 보조 행동. 흰색 배경 + Ink 테두리. */
  secondary: "border border-ink/15 bg-white text-ink transition hover:border-ink/35",
  /** 피치 강조 행동(예: 내 주변 보기). */
  brand: "bg-brand-500 text-ink shadow-sm hover:bg-brand-100",
  /** 카카오 브랜드 가이드 색상. 로그인 버튼 전용. */
  kakao: "bg-[#FEE500] text-[#191919] shadow-sm hover:brightness-95",
} as const;

export type ButtonSize = keyof typeof SIZE;
export type ButtonVariant = keyof typeof VARIANT;

export function buttonClass(variant: ButtonVariant, size: ButtonSize = "md", className = "") {
  return `inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition ${VARIANT[variant]} ${SIZE[size]} ${className}`.trim();
}
