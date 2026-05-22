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
      className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5e7eb] px-3 py-3 transition hover:bg-[#f8fafc] last:border-b-0 sm:min-h-24 sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0"
      aria-label={`${category.name} 기사 목록 보기`}
    >
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-normal text-[#111827] sm:text-lg">{category.name}</h2>
        <dl className="mt-2 grid max-w-44 grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="font-medium text-[#6b7280]">전체</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#111827]">{category.articleCount}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#6b7280]">미읽음</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#b42318]">{category.unreadCount}</dd>
          </div>
        </dl>
      </div>
      <ArrowRight
        aria-hidden="true"
        className="text-[#9ca3af] transition group-hover:translate-x-0.5 group-hover:text-[#b42318]"
        size={17}
      />
    </Link>
  );
}
