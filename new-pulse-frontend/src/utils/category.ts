import { CATEGORY_CODES, type CategoryCode } from "../types/api";

const CATEGORY_CODE_SET = new Set<string>(CATEGORY_CODES);

export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  POLITICS: "정치",
  NORTH_KOREA: "북한",
  ECONOMY: "경제",
  INDUSTRY: "산업",
  SOCIETY: "사회"
};

export function isCategoryCode(value: string | undefined): value is CategoryCode {
  return typeof value === "string" && CATEGORY_CODE_SET.has(value);
}

export function getCategoryLabel(categoryCode: CategoryCode): string {
  return CATEGORY_LABELS[categoryCode];
}
