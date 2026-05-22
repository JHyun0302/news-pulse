import type {
  ArticleDetail,
  ArticlesResponse,
  CategoryCode,
  ReadStateResponse
} from "../types/api";
import { requestJson } from "./client";

interface FetchArticlesParams {
  category: CategoryCode;
  clientId: string;
  limit?: number;
}

export function fetchArticles({
  category,
  clientId,
  limit = 50
}: FetchArticlesParams): Promise<ArticlesResponse> {
  const params = new URLSearchParams({
    category,
    clientId,
    limit: String(limit)
  });

  return requestJson<ArticlesResponse>(`/api/articles?${params.toString()}`);
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
