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
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backCategory ? `/categories/${backCategory}` : "/"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b8a7e] hover:text-[#22675d]"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          목록으로
        </Link>
        {readMutation.isError ? (
          <span className="text-sm font-medium text-[#8d352d]">읽음 처리 실패</span>
        ) : null}
      </div>

      {articleQuery.isLoading ? <LoadingBlock label="기사 상세 정보를 불러오는 중" /> : null}

      {articleQuery.isError ? (
        <ErrorState message={articleQuery.error.message} onRetry={() => void articleQuery.refetch()} />
      ) : null}

      {articleQuery.isSuccess ? (
        <article className="rounded-lg border border-[#d9d2c4] bg-[#fffdf8] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={markedRead || readMutation.isSuccess || articleQuery.data.read ? "read" : "unread"} />
            {articleQuery.data.categories.map((category) => (
              <span
                key={category}
                className="inline-flex h-7 items-center rounded-lg border border-[#75a99f] bg-[#e3f3ef] px-2.5 text-xs font-semibold text-[#22675d]"
              >
                {category}
              </span>
            ))}
          </div>

          <h1 className="mt-5 break-keep text-2xl font-bold tracking-normal text-[#1f2933] sm:text-4xl">
            {articleQuery.data.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#647067]">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" size={16} />
              {articleQuery.data.creator || "작성자 미상"}
            </span>
            <time dateTime={articleQuery.data.publishedAt}>{formatPublishedAt(articleQuery.data.publishedAt)}</time>
            <span>{articleQuery.data.articleId}</span>
          </div>

          <div className="mt-8 border-t border-[#ded8ce] pt-5">
            <p className="max-w-3xl text-sm leading-7 text-[#4d5a53]">
              원문 본문은 저장하지 않고 연합뉴스 원문 링크를 새 탭으로 엽니다.
            </p>
            <a
              href={articleQuery.data.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2b8a7e] px-4 text-sm font-semibold text-white hover:bg-[#22675d]"
            >
              <ExternalLink aria-hidden="true" size={17} />
              원문 열기
            </a>
          </div>
        </article>
      ) : null}
    </section>
  );
}
