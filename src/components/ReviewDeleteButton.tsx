"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-semibold text-muted underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-60"
    >
      삭제
    </button>
  );
}
