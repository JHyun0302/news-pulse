import { ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategorySummary } from "../types/api";

interface CategoryCardProps {
  category: CategorySummary;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/categories/${category.code}`}
      className="group flex min-h-40 flex-col justify-between rounded-lg border border-[#d9d2c4] bg-[#fffdf8] p-5 shadow-sm transition hover:border-[#2b8a7e] hover:shadow-md"
      aria-label={`${category.name} 기사 목록 보기`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#647067]">{category.code}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-[#1f2933]">{category.name}</h2>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e3f3ef] text-[#22675d]">
          <Newspaper aria-hidden="true" size={20} />
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-[#7b7469]">전체</dt>
            <dd className="mt-1 text-xl font-semibold">{category.articleCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#7b7469]">미읽음</dt>
            <dd className="mt-1 text-xl font-semibold text-[#a05d12]">{category.unreadCount}</dd>
          </div>
        </dl>
        <ArrowRight
          aria-hidden="true"
          className="text-[#2b8a7e] transition group-hover:translate-x-1"
          size={20}
        />
      </div>
    </Link>
  );
}
