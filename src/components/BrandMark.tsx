import Link from "next/link";

export function PawMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-[14px] bg-brand-500 text-white shadow-[inset_0_-3px_0_rgba(126,48,20,.14)] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <ellipse cx="20" cy="24" rx="8" ry="7" fill="currentColor" />
        <ellipse cx="11.5" cy="16" rx="3.4" ry="4.5" transform="rotate(-24 11.5 16)" fill="currentColor" />
        <ellipse cx="28.5" cy="16" rx="3.4" ry="4.5" transform="rotate(24 28.5 16)" fill="currentColor" />
        <ellipse cx="19" cy="12" rx="3.5" ry="4.7" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="함께가개 홈">
      <PawMark />
      {!compact && (
        <span className="leading-none">
          <strong className="block text-[19px] font-bold tracking-[-0.04em] text-ink">함께가개</strong>
          <span className="mt-1 block text-[9px] font-bold tracking-[0.16em] text-sage-700">SEOUL PET PLACES</span>
        </span>
      )}
    </Link>
  );
}
