interface LoadingBlockProps {
  label?: string;
}

export function LoadingBlock({ label = "데이터를 불러오는 중" }: LoadingBlockProps) {
  return (
    <div className="rounded-lg border border-[#ded8ce] bg-[#fffdf8] p-5" role="status" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded-lg bg-[#d8d1c5]" />
      <div className="mt-4 grid gap-3">
        <div className="h-12 animate-pulse rounded-lg bg-[#ebe5da]" />
        <div className="h-12 animate-pulse rounded-lg bg-[#ebe5da]" />
        <div className="h-12 animate-pulse rounded-lg bg-[#ebe5da]" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
