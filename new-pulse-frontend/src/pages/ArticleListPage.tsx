import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ArticleListItem } from "../components/ArticleListItem";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingBlock } from "../components/LoadingBlock";
import { useArticlesQuery } from "../hooks/useArticles";
import { useClientId } from "../hooks/useClientId";
import { isCategoryCode } from "../utils/category";

export function ArticleListPage() {
  const { categoryCode } = useParams();
  const clientId = useClientId();

  if (!isCategoryCode(categoryCode)) {
    return (
      <ErrorState
        title="알 수 없는 카테고리"
        message="지원하지 않는 카테고리 코드입니다. 카테고리 화면에서 다시 선택해 주세요."
      />
    );
  }

  const articlesQuery = useArticlesQuery(categoryCode, clientId);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-[#d8dee8] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#b42318] hover:text-[#8f1d14]"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            카테고리
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-normal text-[#111827] sm:text-3xl">
            {articlesQuery.data?.category.name ?? categoryCode}
          </h1>
          {articlesQuery.isSuccess ? (
            <p className="mt-1 text-sm text-[#6b7280]">총 {articlesQuery.data.items.length}개 기사</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void articlesQuery.refetch()}
          className="inline-flex h-9 items-center justify-center gap-2 border border-[#c7cdd6] bg-white px-3 text-sm font-semibold text-[#374151] hover:border-[#b42318] hover:text-[#b42318]"
        >
          <RefreshCw aria-hidden="true" size={16} />
          새로고침
        </button>
      </div>

      {articlesQuery.isLoading ? <LoadingBlock label="기사 목록을 불러오는 중" /> : null}

      {articlesQuery.isError ? (
        <ErrorState message={articlesQuery.error.message} onRetry={() => void articlesQuery.refetch()} />
      ) : null}

      {articlesQuery.isSuccess && articlesQuery.data.items.length === 0 ? (
        <EmptyState title="표시할 기사가 없습니다" description="RSS 수집 후 다시 확인해 주세요." />
      ) : null}

      {articlesQuery.isSuccess && articlesQuery.data.items.length > 0 ? (
        <ul className="divide-y divide-[#e5e7eb] border-y border-[#d8dee8] bg-white">
          {articlesQuery.data.items.map((article) => (
            <ArticleListItem key={article.articleId} article={article} categoryCode={categoryCode} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
