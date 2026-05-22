import { describe, expect, it } from "vitest";
import { getCategoryLabel, isCategoryCode } from "./category";

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
});
