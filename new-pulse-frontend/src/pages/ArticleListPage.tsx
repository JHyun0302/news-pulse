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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b8a7e] hover:text-[#22675d]"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            카테고리
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-[#1f2933]">
            {articlesQuery.data?.category.name ?? categoryCode}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void articlesQuery.refetch()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2b8a7e] bg-[#fffdf8] px-3 text-sm font-semibold text-[#22675d] hover:bg-[#e3f3ef]"
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
        <ul className="space-y-3">
          {articlesQuery.data.items.map((article) => (
            <ArticleListItem key={article.articleId} article={article} categoryCode={categoryCode} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
