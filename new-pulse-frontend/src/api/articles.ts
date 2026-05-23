import type {
  ArticleDetail,
  ArticlesResponse,
  CategoryCode,
  ReadStateResponse
} from "../types/api";
import { requestJson } from "./client";

export const ARTICLE_PAGE_SIZE = 50;

interface FetchArticlesParams {
  category: CategoryCode;
  clientId: string;
  limit?: number;
  offset?: number;
}

export function fetchArticles({
  category,
  clientId,
  limit = ARTICLE_PAGE_SIZE,
  offset = 0
}: FetchArticlesParams): Promise<ArticlesResponse> {
  const params = new URLSearchParams({
    category,
    clientId,
    limit: String(limit),
    offset: String(offset)
  });

  return requestJson<Partial<ArticlesResponse> & Pick<ArticlesResponse, "category" | "items">>(
    `/api/articles?${params.toString()}`
  ).then((response) => ({
    ...response,
    page:
      response.page ??
      {
        totalCount: response.items.length,
        limit,
        offset,
        hasNext: false,
        nextOffset: null
      }
  }));
}

export function fetchArticle(articleId: string, clientId: string): Promise<ArticleDetail> {
  const params = new URLSearchParams({ clientId });
  return requestJson<ArticleDetail>(`/api/articles/${encodeURIComponent(articleId)}?${params.toString()}`);
}

export function markArticleRead(articleId: string, clientId: string): Promise<ReadStateResponse> {
  return requestJson<ReadStateResponse>(`/api/articles/${encodeURIComponent(articleId)}/read`, {
    method: "POST",
    body: JSON.stringify({ clientId })
  });
}
