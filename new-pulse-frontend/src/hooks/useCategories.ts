import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";

export function useCategoriesQuery(clientId: string) {
  return useQuery({
    queryKey: ["categories", clientId],
    queryFn: () => fetchCategories(clientId)
  });
}
