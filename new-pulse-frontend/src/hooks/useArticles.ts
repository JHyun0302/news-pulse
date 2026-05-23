import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ARTICLE_PAGE_SIZE, fetchArticle, fetchArticles, markArticleRead } from "../api/articles";
import type { CategoryCode } from "../types/api";

export function useArticlesQuery(category: CategoryCode, clientId: string) {
  return useInfiniteQuery({
    queryKey: ["articles", category, clientId],
    queryFn: ({ pageParam }) =>
      fetchArticles({
        category,
        clientId,
        limit: ARTICLE_PAGE_SIZE,
        offset: pageParam
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.page.hasNext) {
        return undefined;
      }

      return lastPage.page.nextOffset ?? lastPage.page.offset + lastPage.page.limit;
    }
  });
}

export function useArticleDetailQuery(articleId: string, clientId: string) {
  return useQuery({
    queryKey: ["article", articleId, clientId],
    queryFn: () => fetchArticle(articleId, clientId),
    enabled: articleId.length > 0
  });
}

export function useMarkArticleReadMutation(articleId: string, clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markArticleRead(articleId, clientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["article", articleId, clientId] });
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({ queryKey: ["categories", clientId] });
    }
  });
}
