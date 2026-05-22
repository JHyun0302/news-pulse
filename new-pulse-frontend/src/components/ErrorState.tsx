import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "요청 실패", message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-[#d9938b] bg-[#fff7f4] px-5 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-[#8d352d]" size={22} />
          <div>
            <h2 className="font-semibold tracking-normal text-[#8d352d]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#6c4b46]">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#8d352d] px-3 text-sm font-semibold text-[#8d352d] hover:bg-[#f9e7e3]"
          >
            <RotateCcw aria-hidden="true" size={16} />
            다시 시도
          </button>
        ) : null}
      </div>
    </div>
  );
}
