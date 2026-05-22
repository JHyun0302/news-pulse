import { CATEGORY_CODES, type CategoryCode } from "../types/api";

const CATEGORY_CODE_SET = new Set<string>(CATEGORY_CODES);

export function isCategoryCode(value: string | undefined): value is CategoryCode {
  return typeof value === "string" && CATEGORY_CODE_SET.has(value);
}
