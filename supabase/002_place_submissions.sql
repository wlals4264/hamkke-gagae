-- 제보(신규 장소 등록) 테이블. Supabase SQL Editor에서 1회 실행하세요.
-- status='approved'인 행이 실제 지도/목록에 그대로 노출됩니다(place_submissions가
-- 제보 대기열이자 커뮤니티 장소의 데이터 소스 역할을 함께 함).

create table if not exists place_submissions (
  id text primary key,
  kakao_id text not null,
  nickname text not null,
  name text not null,
  category text not null check (category in ('cafe', 'restaurant', 'park', 'mall')),
  gu text not null,
  gu_name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null default '',
  pet_policy jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists place_submissions_status_idx on place_submissions (status);
create index if not exists place_submissions_gu_idx on place_submissions (gu);

alter table place_submissions enable row level security;
-- 정책 없음 = 기본적으로 모든 직접 접근 차단. service_role 키(Next.js 서버)만 접근.
