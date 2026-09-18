-- 후기(리뷰) 테이블. Supabase SQL Editor에서 1회 실행하세요.
-- 로그인은 Supabase Auth가 아니라 자체 카카오 OAuth(JWT 세션)로 처리하므로,
-- auth.uid() 기반 RLS는 쓰지 않습니다. 모든 접근은 Next.js 서버(service_role
-- 키)를 통해서만 이뤄지고, RLS는 기본적으로 막아 둬서 다른 키로는 직접 접근이
-- 안 되게 합니다.

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,
  kakao_id text not null,
  nickname text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, kakao_id)
);

create index if not exists reviews_place_id_idx on reviews (place_id);

alter table reviews enable row level security;
-- 정책을 만들지 않아 기본적으로 모든 접근이 막힙니다. service_role 키는 RLS를
-- 우회하므로 Next.js 서버 라우트에서는 그대로 읽기/쓰기 가능합니다.
