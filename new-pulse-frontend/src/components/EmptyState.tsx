import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[#cfc7ba] bg-[#fffdf8] px-5 py-10 text-center">
      <FileSearch aria-hidden="true" className="mx-auto text-[#7b7469]" size={36} />
      <h2 className="mt-4 text-lg font-semibold tracking-normal text-[#1f2933]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#647067]">{description}</p>
    </div>
  );
}
