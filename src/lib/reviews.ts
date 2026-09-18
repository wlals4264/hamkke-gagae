import { createAdminClient } from "@/lib/supabase/server";

export interface Review {
  id: string;
  place_id: string;
  kakao_id: string;
  nickname: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
}

export async function getReviewsForPlace(placeId: string): Promise<Review[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("후기 조회 실패:", error);
    return [];
  }
  return data as Review[];
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

interface UpsertReviewInput {
  placeId: string;
  kakaoId: string;
  nickname: string;
  rating: number;
  body: string;
}

export async function upsertReview(input: UpsertReviewInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").upsert(
    {
      place_id: input.placeId,
      kakao_id: input.kakaoId,
      nickname: input.nickname,
      rating: input.rating,
      body: input.body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "place_id,kakao_id" },
  );
  if (error) throw new Error(`후기 저장 실패: ${error.message}`);
}

export async function deleteReview(reviewId: string, kakaoId: string) {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("reviews")
    .delete({ count: "exact" })
    .eq("id", reviewId)
    .eq("kakao_id", kakaoId);
  if (error) throw new Error(`후기 삭제 실패: ${error.message}`);
  return (count ?? 0) > 0;
}
