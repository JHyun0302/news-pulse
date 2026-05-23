import { CATEGORY_CODES, type CategoryCode } from "../types/api";

const CATEGORY_CODE_SET = new Set<string>(CATEGORY_CODES);

export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  POLITICS: "정치",
  NORTH_KOREA: "북한",
  ECONOMY: "경제",
  INDUSTRY: "산업",
  SOCIETY: "사회"
};

export const CATEGORY_SLUGS: Record<CategoryCode, string> = {
  POLITICS: "politics",
  NORTH_KOREA: "north-korea",
  ECONOMY: "economy",
  INDUSTRY: "industry",
  SOCIETY: "society"
};

const CATEGORY_CODE_BY_SLUG = new Map<string, CategoryCode>(
  CATEGORY_CODES.map((categoryCode) => [CATEGORY_SLUGS[categoryCode], categoryCode])
);

export function isCategoryCode(value: string | undefined): value is CategoryCode {
  return typeof value === "string" && CATEGORY_CODE_SET.has(value);
}

export function getCategoryLabel(categoryCode: CategoryCode): string {
  return CATEGORY_LABELS[categoryCode];
}

export function getCategorySlug(categoryCode: CategoryCode): string {
  return CATEGORY_SLUGS[categoryCode];
}

export function getCategoryCodeFromSlug(value: string | undefined): CategoryCode | undefined {
  if (isCategoryCode(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return CATEGORY_CODE_BY_SLUG.get(value.toLowerCase());
}

export function isCanonicalCategorySlug(value: string | undefined, categoryCode: CategoryCode): boolean {
  return value === getCategorySlug(categoryCode);
}
