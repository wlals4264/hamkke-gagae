"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label: string;
  className?: string;
}

export default function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근이 막힌 환경 - 조용히 무시
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted transition hover:bg-sage-100 hover:text-ink ${className ?? ""}`}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M5 12.5 9.5 17 19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <rect x="8.5" y="8.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
