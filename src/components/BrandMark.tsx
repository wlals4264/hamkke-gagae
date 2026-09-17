import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export function PawMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full overflow-visible" fill="none" focusable="false">
        <g transform="translate(1 25) rotate(-18 16 16)" fill="#A5AF79">
          <ellipse cx="4" cy="12" rx="3.8" ry="5" transform="rotate(-24 4 12)" />
          <ellipse cx="12" cy="5.5" rx="4" ry="5.2" transform="rotate(-8 12 5.5)" />
          <ellipse cx="21" cy="5.5" rx="4" ry="5.2" transform="rotate(8 21 5.5)" />
          <ellipse cx="29" cy="12" rx="3.8" ry="5" transform="rotate(24 29 12)" />
          <path d="M7 22c2-3 4-9 9.5-9s7.5 6 9.5 9c3 5 0 10-5 9-2-.4-3-1.5-4.5-1.5S14 30.6 12 31c-5 1-8-4-5-9Z" />
        </g>
        <g transform="translate(30 3) rotate(16 16 16)" fill="#E8A07C">
          <ellipse cx="4" cy="12" rx="3.8" ry="5" transform="rotate(-24 4 12)" />
          <ellipse cx="12" cy="5.5" rx="4" ry="5.2" transform="rotate(-8 12 5.5)" />
          <ellipse cx="21" cy="5.5" rx="4" ry="5.2" transform="rotate(8 21 5.5)" />
          <ellipse cx="29" cy="12" rx="3.8" ry="5" transform="rotate(24 29 12)" />
          <path d="M7 22c2-3 4-9 9.5-9s7.5 6 9.5 9c3 5 0 10-5 9-2-.4-3-1.5-4.5-1.5S14 30.6 12 31c-5 1-8-4-5-9Z" />
        </g>
      </svg>
    </span>
  );
}

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label={`${BRAND_NAME} 홈`}>
      <PawMark />
      {!compact && (
        <span className="leading-none">
          <strong className="block text-[19px] font-bold tracking-[-0.04em] text-ink">{BRAND_NAME}</strong>
          <span className="mt-1 block text-[9px] font-bold tracking-[0.16em] text-sage-700">SEOUL PET PLACES</span>
        </span>
      )}
    </Link>
  );
}
