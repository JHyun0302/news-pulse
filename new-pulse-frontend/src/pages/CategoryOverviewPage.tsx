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
    <section className="space-y-5">
      <div className="border-b border-[#d8dee8] pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#b42318]">News Categories</p>
        <div>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-[#111827] sm:text-3xl">카테고리</h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">정치, 북한, 경제, 산업, 사회 뉴스를 빠르게 확인합니다.</p>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {categoriesQuery.data.items.map((category) => (
            <CategoryCard key={category.code} category={category} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
