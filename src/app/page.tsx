import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-5xl">🐾</span>
      <h1 className="text-3xl font-bold text-neutral-900">서울 반려동물 동반 지도</h1>
      <p className="text-neutral-600">
        구별로, 카테고리별로, 혹은 내 위치 기준으로 반려동물과 함께 갈 수 있는
        카페·식당·공원·쇼핑몰을 지도에서 찾아보세요.
      </p>
      <Link
        href="/seoul"
        className="rounded-full bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700"
      >
        지도 보러 가기
      </Link>
      <p className="text-xs text-neutral-400">
        ⚠️ 현재 장소 데이터는 개발용 샘플입니다. 실제 운영 정보와 다를 수 있어요.
      </p>
    </main>
  );
}
