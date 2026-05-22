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
        className={`grid gap-3 rounded-lg border p-4 transition hover:border-[#2b8a7e] hover:bg-[#fffdf8] sm:grid-cols-[1fr_auto] sm:items-center ${
          article.read
            ? "border-[#ded8ce] bg-[#f7f5f0] text-[#647067]"
            : "border-[#d0b98f] bg-[#fffdf8] text-[#1f2933] shadow-sm"
        }`}
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge variant={article.read ? "read" : "unread"} />
            <span className="text-xs font-medium text-[#7b7469]">{article.articleId}</span>
          </div>
          <h2
            className={`break-keep text-lg tracking-normal sm:text-xl ${
              article.read ? "font-medium" : "font-bold"
            }`}
          >
            {article.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#647067]">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" size={15} />
              {article.creator || "작성자 미상"}
            </span>
            <time className="inline-flex items-center gap-1.5" dateTime={article.publishedAt}>
              <Clock3 aria-hidden="true" size={15} />
              {formatPublishedAt(article.publishedAt)}
            </time>
          </div>
        </div>
        <ChevronRight aria-hidden="true" className="hidden text-[#2b8a7e] sm:block" size={22} />
      </Link>
    </li>
  );
}
