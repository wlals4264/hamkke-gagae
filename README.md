# 꼬리따라 (kkori-ttara)

꼬리 따라 발견한 좋은 곳.

서울 구별로 반려동물과 함께 갈 수 있는 카페·식당·공원·쇼핑몰을 지도에서 찾아보는 데모 프로젝트입니다.
직방(온하우스) 프론트엔드 개발자 채용 지원을 계기로, "지도 기반 서비스 + SEO"를 직접 설계·구현해보기 위해 만들었습니다.

> ℹ️ `src/data/places.json`의 장소 데이터는 한국관광공사 TourAPI(반려동물 동반여행 정보)에서 가져온 실제 데이터입니다. 서울 25개 구 전체를 대상으로 `npm run fetch:tour-data`를 실행하면 최신 데이터로 다시 생성할 수 있습니다 (`.env.local`에 `TOUR_API_KEY` 필요, data.go.kr에서 "한국관광공사_국문 관광정보 서비스_GW" 활용신청 후 발급).

## 실행 방법

```bash
npm install
cp .env.local.example .env.local   # 카카오맵 키를 넣어주세요 (없어도 지도만 빈 안내문으로 대체되고 나머지는 정상 작동)
npm run dev
```

`http://localhost:3000` 접속 후 "지도 보러 가기"를 누르면 `/seoul`로 이동합니다.

### 카카오맵 키 발급

1. [카카오 개발자센터](https://developers.kakao.com)에서 애플리케이션 생성
2. [플랫폼] > [Web]에 `http://localhost:3000`과 실제 배포 도메인 등록
3. 발급받은 **JavaScript 키**를 `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY`에 입력

키가 없어도 앱은 정상 실행되며, 지도 영역에만 안내 문구가 표시되고 리스트/필터/현위치 기능은 그대로 작동합니다.

## 이 프로젝트에서 의도적으로 설계한 것들

### 1. "지도 필터링" UX와 SEO를 동시에 잡는 라우팅 구조

처음엔 "지도 위에서 필터링만 하면 되지 않을까" 하는 생각으로 시작했지만, 그렇게 하면 필터 결과마다 고유 URL이 없어서 검색엔진이 "마포구 반려동물 카페"처럼 특정 조건에 대응하는 페이지를 찾을 수 없다는 문제가 있었습니다. 그래서 다음과 같이 절충했습니다.

- `/seoul` — 서울 전체. 카테고리 필터는 클라이언트 상태로만 처리 (URL 불필요할 만큼 조합이 유동적)
- `/seoul/[gu]` — 구별 페이지. **정적 생성(SSG)**, `generateMetadata`로 "OO구 반려동물 동반 지도"라는 타이틀을 자동 생성
- `/seoul/[gu]/[category]` — 구+카테고리 조합. 이것도 SSG로 미리 생성 ("마포구 반려동물 카페"처럼 실제 검색 패턴에 대응)
- `/places/[id]` — 장소 상세. LocalBusiness JSON-LD 구조화 데이터 포함

구를 클릭하거나 카테고리 칩을 누르면 사용자 입장에서는 그냥 "지도가 필터링되는" 것처럼 느껴지지만, 실제로는 Next.js의 클라이언트 라우팅(`<Link>`)으로 위 경로들을 이동하는 것입니다. 즉 **체감 UX는 필터링, 내부 구현은 URL 기반 라우팅**입니다.

### 2. SEO 설계

- `generateStaticParams` + `generateMetadata`로 구·카테고리 조합별 타이틀/설명을 자동 생성
- `src/app/sitemap.ts` — 전체/구별/구+카테고리/장소 상세 URL을 모두 포함한 사이트맵 자동 생성
- `src/app/robots.ts` — robots.txt와 사이트맵 위치 명시
- 장소 상세 페이지에 `LocalBusiness` + `amenityFeature`(반려동물 동반 가능) JSON-LD 구조화 데이터 삽입
- 지도(카카오맵 캔버스)는 클라이언트에서만 그려지지만, 장소 이름·주소·설명 등 텍스트 콘텐츠는 전부 서버 컴포넌트에서 렌더링되어 초기 HTML에 포함됨 (크롤러가 JS 실행 없이도 핵심 정보를 읽을 수 있음)

### 3. 현위치 기반 탐색

`src/components/PlaceExplorer.tsx`의 "내 주변 보기" 버튼은 브라우저 Geolocation API로 좌표를 받아 Haversine 공식(`src/lib/geo.ts`)으로 모든 장소와의 거리를 계산하고 가까운 순으로 정렬합니다. 이 기능은 크롤러와 무관한 순수 클라이언트 UX이므로 별도 라우트 없이 클라이언트 상태로만 처리했습니다.

## 폴더 구조

```
src/
  app/
    page.tsx                     # 랜딩 페이지
    seoul/page.tsx                # 서울 전체 지도
    seoul/[gu]/page.tsx           # 구별 지도 (SSG)
    seoul/[gu]/[category]/page.tsx  # 구+카테고리 지도 (SSG)
    places/[id]/page.tsx          # 장소 상세 (JSON-LD 포함)
    sitemap.ts / robots.ts        # SEO
  components/
    KakaoMap.tsx                  # 카카오맵 SDK 연동 (클라이언트)
    PlaceExplorer.tsx             # 필터+지도+리스트+현위치 통합 UI (클라이언트)
    PlaceList.tsx / PlaceCard.tsx / GuNav.tsx
  lib/
    places.ts                     # 데이터 조회 함수, 구/카테고리 목록
    geo.ts                        # 거리 계산
  types/
    place.ts                      # Place 타입
    kakao.d.ts                    # 카카오맵 SDK 최소 타입 선언
  data/
    places.json                   # 샘플 장소 데이터 (5개 구 x 18곳)
```

## 앞으로 할 일 (TODO)

- [ ] 한국관광공사 TourAPI(반려동반여행 데이터)로 실제 데이터 연동, `src/lib/places.ts`의 데이터 소스만 교체하면 되도록 이미 함수 인터페이스를 분리해둠
- [ ] 서울 25개 구 전체로 확장 (`GU_LIST`에 추가)
- [ ] 장소 상세페이지에 실제 사진 추가 (현재는 이미지 없이 텍스트/이모지 배지로만 표시)
- [ ] 사용자 제보/리뷰 기능
- [ ] Lighthouse SEO/접근성 점검 및 실제 배포 후 구글 서치콘솔 등록

## 기술 스택

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · 카카오맵 JavaScript SDK
