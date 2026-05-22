import { ArrowLeft, ExternalLink, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingBlock } from "../components/LoadingBlock";
import { StatusBadge } from "../components/StatusBadge";
import { useArticleDetailQuery, useMarkArticleReadMutation } from "../hooks/useArticles";
import { useClientId } from "../hooks/useClientId";
import type { CategoryCode } from "../types/api";
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
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backCategory ? `/categories/${backCategory}` : "/"}
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
        <article className="border-y border-[#d8dee8] bg-white py-5 sm:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={markedRead || readMutation.isSuccess || articleQuery.data.read ? "read" : "unread"} />
            {articleQuery.data.categories.map((category) => (
              <span
                key={category}
                className="inline-flex h-6 items-center border border-[#c7cdd6] bg-[#f9fafb] px-2 text-xs font-semibold text-[#4b5563]"
              >
                {category}
              </span>
            ))}
          </div>

          <h1 className="mt-5 max-w-5xl break-keep text-2xl font-bold leading-9 tracking-normal text-[#111827] sm:text-4xl sm:leading-[1.25]">
            {articleQuery.data.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-[#e5e7eb] pb-5 text-sm text-[#6b7280]">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" size={16} />
              {articleQuery.data.creator || "작성자 미상"}
            </span>
            <time dateTime={articleQuery.data.publishedAt}>{formatPublishedAt(articleQuery.data.publishedAt)}</time>
            <span>{articleQuery.data.articleId}</span>
          </div>

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
