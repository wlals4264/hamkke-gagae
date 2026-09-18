"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/lib/ui/button";

interface ReviewFormProps {
  placeId: string;
  initialRating?: number;
  initialBody?: string;
}

export default function ReviewForm({ placeId, initialRating, initialBody }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 5);
  const [body, setBody] = useState(initialBody ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, rating, body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "후기 저장에 실패했습니다.");
      }
      if (!initialBody) setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "후기 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`${star}점`}
            className="text-xl leading-none"
          >
            {star <= rating ? "⭐️" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="반려동물과 함께한 경험을 남겨주세요."
        maxLength={1000}
        rows={3}
        required
        className="resize-none rounded-xl border border-ink/10 bg-cream/40 p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-500"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={submitting} className={buttonClass("primary", "md", "self-end disabled:opacity-60")}>
        {submitting ? "저장 중..." : initialBody ? "후기 수정하기" : "후기 남기기"}
      </button>
    </form>
  );
}
