import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "요청 실패", message, onRetry }: ErrorStateProps) {
  return (
    <div className="border border-[#f2b8b5] border-l-4 border-l-[#b42318] bg-white px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-[#b42318]" size={22} />
          <div>
            <h2 className="font-semibold tracking-normal text-[#9f1f14]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#4b5563]">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center gap-2 border border-[#b42318] px-3 text-sm font-semibold text-[#b42318] hover:bg-[#fff1f0]"
          >
            <RotateCcw aria-hidden="true" size={16} />
            다시 시도
          </button>
        ) : null}
      </div>
    </div>
  );
}
