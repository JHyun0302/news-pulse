import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategorySummary } from "../types/api";

interface CategoryCardProps {
  category: CategorySummary;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/categories/${category.code}`}
      className="group flex min-h-28 flex-col justify-between border border-[#d8dee8] bg-white px-3 py-3 transition hover:border-[#b42318] hover:bg-[#fafafa] sm:px-4"
      aria-label={`${category.name} 기사 목록 보기`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold tracking-normal text-[#111827] sm:text-xl">{category.name}</h2>
        <ArrowRight
          aria-hidden="true"
          className="mt-1 text-[#9ca3af] transition group-hover:translate-x-0.5 group-hover:text-[#b42318]"
          size={18}
        />
      </div>
      <p className="mt-1 text-xs font-medium text-[#6b7280]">{category.code}</p>
      <div className="mt-4">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs font-medium text-[#6b7280]">전체</dt>
            <dd className="mt-0.5 font-semibold text-[#111827]">{category.articleCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#6b7280]">미읽음</dt>
            <dd className="mt-0.5 font-semibold text-[#b42318]">{category.unreadCount}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
