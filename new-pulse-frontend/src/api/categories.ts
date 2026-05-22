import type { CategoriesResponse } from "../types/api";
import { requestJson } from "./client";

export function fetchCategories(clientId: string): Promise<CategoriesResponse> {
  const params = new URLSearchParams({ clientId });
  return requestJson<CategoriesResponse>(`/api/categories?${params.toString()}`);
}
