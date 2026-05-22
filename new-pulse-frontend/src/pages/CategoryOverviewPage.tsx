import { CategoryCard } from "../components/CategoryCard";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingBlock } from "../components/LoadingBlock";
import { useCategoriesQuery } from "../hooks/useCategories";
import { useClientId } from "../hooks/useClientId";

export function CategoryOverviewPage() {
  const clientId = useClientId();
  const categoriesQuery = useCategoriesQuery(clientId);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-[#1f2933]">카테고리</h1>
          <p className="mt-2 text-sm leading-6 text-[#647067]">
            관심 있는 분야를 선택해 최신 기사와 읽음 상태를 확인합니다.
          </p>
        </div>
      </div>

      {categoriesQuery.isLoading ? <LoadingBlock label="카테고리를 불러오는 중" /> : null}

      {categoriesQuery.isError ? (
        <ErrorState
          message={categoriesQuery.error.message}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : null}

      {categoriesQuery.isSuccess && categoriesQuery.data.items.length === 0 ? (
        <EmptyState title="표시할 카테고리가 없습니다" description="백엔드 카테고리 API 응답을 확인해 주세요." />
      ) : null}

      {categoriesQuery.isSuccess && categoriesQuery.data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesQuery.data.items.map((category) => (
            <CategoryCard key={category.code} category={category} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
