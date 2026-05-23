import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingBlock } from "../components/LoadingBlock";
import { StatusBadge } from "../components/StatusBadge";
import { useArticleDetailQuery, useMarkArticleReadMutation } from "../hooks/useArticles";
import { useClientId } from "../hooks/useClientId";
import type { CategoryCode } from "../types/api";
import { getCategoryLabel, getCategorySlug } from "../utils/category";
import { formatPublishedAt } from "../utils/date";

interface DetailLocationState {
  fromCategory?: CategoryCode;
}

export function ArticleDetailPage() {
  const { articleId = "" } = useParams();
  const clientId = useClientId();
  const location = useLocation();
  const fromCategory = (location.state as DetailLocationState | null)?.fromCategory;
  const articleQuery = useArticleDetailQuery(articleId, clientId);
  const readMutation = useMarkArticleReadMutation(articleId, clientId);
  const markedArticleIdRef = useRef<string | null>(null);
  const [markedRead, setMarkedRead] = useState(false);

  useEffect(() => {
    setMarkedRead(false);
  }, [articleId]);

  useEffect(() => {
    if (articleId.length > 0 && articleQuery.isSuccess && markedArticleIdRef.current !== articleId) {
      markedArticleIdRef.current = articleId;
      readMutation.mutate(undefined, {
        onSuccess: () => setMarkedRead(true)
      });
    }
  }, [articleId, articleQuery.isSuccess, readMutation.mutate]);

  const backCategory = fromCategory ?? articleQuery.data?.categories[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backCategory ? `/categories/${getCategorySlug(backCategory)}` : "/"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#b42318] hover:text-[#8f1d14]"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          목록으로
        </Link>
        {readMutation.isError ? (
          <span className="text-sm font-medium text-[#b42318]">읽음 처리 실패</span>
        ) : null}
      </div>

      {articleQuery.isLoading ? <LoadingBlock label="기사 상세 정보를 불러오는 중" /> : null}

      {articleQuery.isError ? (
        <ErrorState message={articleQuery.error.message} onRetry={() => void articleQuery.refetch()} />
      ) : null}

      {articleQuery.isSuccess ? (
        <article className="border-y border-[#d8dee8] bg-white py-5 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={markedRead || readMutation.isSuccess || articleQuery.data.read ? "read" : "unread"} />
            {articleQuery.data.categories.map((category) => (
              <span
                key={category}
                className="inline-flex h-6 items-center border border-[#c7cdd6] bg-[#f9fafb] px-2 text-xs font-semibold text-[#4b5563]"
              >
                {getCategoryLabel(category)}
              </span>
            ))}
          </div>

          <h1 className="mt-4 max-w-5xl break-keep text-2xl font-bold leading-9 tracking-normal text-[#111827] sm:text-4xl sm:leading-[1.25]">
            {articleQuery.data.title}
          </h1>

          <dl className="mt-5 grid gap-2 border-y border-[#e5e7eb] py-3 text-sm text-[#6b7280] sm:grid-cols-[auto_auto_1fr] sm:gap-x-5">
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-semibold text-[#374151]">기자</dt>
              <dd className="min-w-0 break-keep">{articleQuery.data.creator || "작성자 미상"}</dd>
            </div>
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-semibold text-[#374151]">송고</dt>
              <dd>
                <time dateTime={articleQuery.data.publishedAt}>
                  {formatPublishedAt(articleQuery.data.publishedAt)}
                </time>
              </dd>
            </div>
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 font-semibold text-[#374151]">기사ID</dt>
              <dd className="min-w-0 break-all text-[#6b7280]">{articleQuery.data.articleId}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <a
              href={articleQuery.data.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#111827] px-4 text-sm font-semibold text-white hover:bg-[#b42318]"
            >
              <ExternalLink aria-hidden="true" size={17} />
              연합뉴스 원문 보기
            </a>
          </div>
        </article>
      ) : null}
    </section>
  );
}
