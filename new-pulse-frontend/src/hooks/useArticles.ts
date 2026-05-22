import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticle, fetchArticles, markArticleRead } from "../api/articles";
import type { CategoryCode } from "../types/api";

export function useArticlesQuery(category: CategoryCode, clientId: string) {
  return useQuery({
    queryKey: ["articles", category, clientId],
    queryFn: () => fetchArticles({ category, clientId })
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
