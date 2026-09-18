"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/lib/ui/button";

export default function AdminSubmissionActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function act(action: "approve" | "reject") {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("approve")}
        className={buttonClass("primary", "sm", "disabled:opacity-60")}
      >
        승인
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("reject")}
        className={buttonClass("secondary", "sm", "disabled:opacity-60")}
      >
        거절
      </button>
    </div>
  );
}
