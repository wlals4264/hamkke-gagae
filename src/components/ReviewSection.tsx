import { getSession } from "@/lib/auth/session";
import { getReviewsForPlace, averageRating } from "@/lib/reviews";
import ReviewForm from "./ReviewForm";
import ReviewDeleteButton from "./ReviewDeleteButton";

function stars(rating: number) {
  return "⭐️".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ReviewSection({ placeId }: { placeId: string }) {
  const [session, reviews] = await Promise.all([getSession(), getReviewsForPlace(placeId)]);
  const avg = averageRating(reviews);
  const myReview = session ? reviews.find((r) => r.kakao_id === session.kakaoId) : undefined;

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">후기 {reviews.length}개</h2>
        {avg !== null && (
          <span className="text-sm font-bold text-ink">⭐️ {avg.toFixed(1)}</span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {reviews.length === 0 && (
          <p className="text-sm text-muted">아직 후기가 없어요. 첫 후기를 남겨보세요!</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl bg-cream/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-ink">{review.nickname}</p>
                <p className="text-xs text-muted">
                  {stars(review.rating)} · {formatDate(review.created_at)}
                </p>
              </div>
              {session?.kakaoId === review.kakao_id && <ReviewDeleteButton reviewId={review.id} />}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{review.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {session ? (
          <ReviewForm
            key={myReview?.id ?? "new"}
            placeId={placeId}
            initialRating={myReview?.rating}
            initialBody={myReview?.body}
          />
        ) : (
          <a
            href={`/api/auth/kakao/login?next=/places/${placeId}`}
            className="block rounded-2xl border border-dashed border-ink/15 bg-cream/40 p-4 text-center text-sm font-semibold text-muted transition hover:border-ink/30 hover:text-ink"
          >
            카카오로 로그인하고 후기 남기기
          </a>
        )}
      </div>
    </section>
  );
}
