import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[#c7cdd6] bg-white px-5 py-10 text-center">
      <FileSearch aria-hidden="true" className="mx-auto text-[#9ca3af]" size={34} />
      <h2 className="mt-4 text-lg font-semibold tracking-normal text-[#111827]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6b7280]">{description}</p>
    </div>
  );
}
