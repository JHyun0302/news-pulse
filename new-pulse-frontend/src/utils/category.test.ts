import { describe, expect, it } from "vitest";
import {
  getCategoryCodeFromSlug,
  getCategoryLabel,
  getCategorySlug,
  isCanonicalCategorySlug,
  isCategoryCode
} from "./category";

describe("category utils", () => {
  it("지원하는 카테고리 코드만 허용한다", () => {
    expect(isCategoryCode("POLITICS")).toBe(true);
    expect(isCategoryCode("UNKNOWN")).toBe(false);
    expect(isCategoryCode(undefined)).toBe(false);
  });

  it("카테고리 코드를 한글 표시명으로 변환한다", () => {
    expect(getCategoryLabel("NORTH_KOREA")).toBe("북한");
    expect(getCategoryLabel("ECONOMY")).toBe("경제");
  });

  it("카테고리 코드를 URL slug로 변환한다", () => {
    expect(getCategorySlug("INDUSTRY")).toBe("industry");
    expect(getCategorySlug("NORTH_KOREA")).toBe("north-korea");
  });

  it("URL slug와 기존 enum URL을 카테고리 코드로 변환한다", () => {
    expect(getCategoryCodeFromSlug("industry")).toBe("INDUSTRY");
    expect(getCategoryCodeFromSlug("north-korea")).toBe("NORTH_KOREA");
    expect(getCategoryCodeFromSlug("INDUSTRY")).toBe("INDUSTRY");
    expect(getCategoryCodeFromSlug("UNKNOWN")).toBeUndefined();
  });

  it("canonical lowercase slug 여부를 판단한다", () => {
    expect(isCanonicalCategorySlug("north-korea", "NORTH_KOREA")).toBe(true);
    expect(isCanonicalCategorySlug("NORTH_KOREA", "NORTH_KOREA")).toBe(false);
  });
});
