import { ChevronRight, Clock3, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { ArticleSummary, CategoryCode } from "../types/api";
import { formatPublishedAt } from "../utils/date";
import { StatusBadge } from "./StatusBadge";

interface ArticleListItemProps {
  article: ArticleSummary;
  categoryCode: CategoryCode;
}

export function ArticleListItem({ article, categoryCode }: ArticleListItemProps) {
  return (
    <li>
      <Link
        to={`/articles/${article.articleId}`}
        state={{ fromCategory: categoryCode }}
        className={`grid gap-3 px-2 py-4 transition hover:bg-[#f8fafc] sm:grid-cols-[1fr_auto] sm:items-center sm:px-3 ${
          article.read
            ? "bg-[#fafafa] text-[#6b7280]"
            : "border-l-2 border-l-[#b42318] bg-white text-[#111827]"
        }`}
      >
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge variant={article.read ? "read" : "unread"} />
            <span className="text-xs font-medium text-[#6b7280]">{article.articleId}</span>
          </div>
          <h2
            className={`break-keep text-base leading-7 tracking-normal sm:text-lg ${
              article.read ? "font-medium text-[#4b5563]" : "font-bold text-[#111827]"
            }`}
          >
            {article.title}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#6b7280] sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" size={14} />
              {article.creator || "작성자 미상"}
            </span>
            <time className="inline-flex items-center gap-1.5" dateTime={article.publishedAt}>
              <Clock3 aria-hidden="true" size={14} />
              {formatPublishedAt(article.publishedAt)}
            </time>
          </div>
        </div>
        <ChevronRight aria-hidden="true" className="hidden text-[#9ca3af] sm:block" size={20} />
      </Link>
    </li>
  );
}
