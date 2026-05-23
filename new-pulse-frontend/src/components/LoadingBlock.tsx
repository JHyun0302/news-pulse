interface LoadingBlockProps {
  label?: string;
}

export function LoadingBlock({ label = "데이터를 불러오는 중" }: LoadingBlockProps) {
  return (
    <div className="border border-[#d8dee8] bg-white p-5" role="status" aria-live="polite">
      <div className="h-4 w-40 animate-pulse bg-[#d8dee8]" />
      <div className="mt-4 grid gap-3">
        <div className="h-10 animate-pulse bg-[#f3f4f6]" />
        <div className="h-10 animate-pulse bg-[#f3f4f6]" />
        <div className="h-10 animate-pulse bg-[#f3f4f6]" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
