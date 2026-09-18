interface SnackbarProps {
  message: string;
  visible: boolean;
}

export default function Snackbar({ message, visible }: SnackbarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 bottom-6 z-50 flex justify-center transition ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-card">
        ✓ {message}
      </span>
    </div>
  );
}
