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
        className={`block px-3 py-3 transition hover:bg-[#f8fafc] sm:px-4 ${
          article.read
            ? "bg-[#fbfbfb] text-[#6b7280]"
            : "border-l-2 border-l-[#b42318] bg-white text-[#111827]"
        }`}
      >
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge variant={article.read ? "read" : "unread"} />
            <span className="text-[11px] font-medium text-[#9ca3af]">기사ID {article.articleId}</span>
          </div>
          <h2
            className={`break-keep text-base leading-6 tracking-normal sm:text-[17px] ${
              article.read ? "font-semibold text-[#4b5563]" : "font-bold text-[#111827]"
            }`}
          >
            {article.title}
          </h2>
          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#6b7280]">
            <span>{article.creator || "작성자 미상"}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
          </div>
        </div>
      </Link>
    </li>
  );
}
