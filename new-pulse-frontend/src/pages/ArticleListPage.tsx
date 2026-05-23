import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ArticleListItem } from "../components/ArticleListItem";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingBlock } from "../components/LoadingBlock";
import { useArticlesQuery } from "../hooks/useArticles";
import { useClientId } from "../hooks/useClientId";
import { getCategoryLabel, isCategoryCode } from "../utils/category";

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
  const pages = articlesQuery.data?.pages ?? [];
  const articles = pages.flatMap((page) => page.items);
  const firstPage = pages[0];
  const totalCount = firstPage?.page.totalCount ?? articles.length;
  const displayedCount = articles.length;
  const categoryName = firstPage?.category.name ?? getCategoryLabel(categoryCode);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-[#d8dee8] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#b42318] hover:text-[#8f1d14]"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            전체 카테고리
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-[#111827] sm:text-3xl">
            {categoryName} 최신뉴스
          </h1>
          {articlesQuery.isSuccess ? (
            <p className="mt-1 text-sm text-[#6b7280]">
              전체 {totalCount}건 중 {displayedCount}건 표시
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void articlesQuery.refetch()}
          disabled={articlesQuery.isFetching && !articlesQuery.isFetchingNextPage}
          className="inline-flex h-9 items-center justify-center gap-2 border border-[#c7cdd6] bg-white px-3 text-sm font-semibold text-[#374151] hover:border-[#b42318] hover:text-[#b42318] sm:self-auto"
        >
          <RefreshCw aria-hidden="true" size={16} />
          새로고침
        </button>
      </div>

      {articlesQuery.isPending ? <LoadingBlock label="기사 목록을 불러오는 중" /> : null}

      {articlesQuery.isError ? (
        <ErrorState message={articlesQuery.error.message} onRetry={() => void articlesQuery.refetch()} />
      ) : null}

      {articlesQuery.isSuccess && articles.length === 0 ? (
        <EmptyState title="표시할 기사가 없습니다" description="RSS 수집 후 다시 확인해 주세요." />
      ) : null}

      {articlesQuery.isSuccess && articles.length > 0 ? (
        <>
          <ul className="divide-y divide-[#e5e7eb] border-y border-[#d8dee8] bg-white">
            {articles.map((article) => (
              <ArticleListItem key={article.articleId} article={article} categoryCode={categoryCode} />
            ))}
          </ul>
          <div className="flex justify-center border-b border-[#d8dee8] py-4">
            {articlesQuery.hasNextPage ? (
              <button
                type="button"
                onClick={() => void articlesQuery.fetchNextPage()}
                disabled={articlesQuery.isFetchingNextPage}
                className="inline-flex min-h-10 w-full items-center justify-center border border-[#c7cdd6] bg-white px-4 text-sm font-semibold text-[#374151] hover:border-[#b42318] hover:text-[#b42318] disabled:cursor-wait disabled:text-[#9ca3af] sm:w-auto"
              >
                {articlesQuery.isFetchingNextPage ? "불러오는 중" : "더보기"}
              </button>
            ) : (
              <p className="text-sm font-medium text-[#6b7280]">전체 {totalCount}건 표시 완료</p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
