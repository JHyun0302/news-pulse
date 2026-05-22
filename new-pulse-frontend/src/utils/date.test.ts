import { describe, expect, it } from "vitest";
import { formatPublishedAt } from "./date";

describe("formatPublishedAt", () => {
  it("ISO 날짜를 한국 시간 표시로 변환한다", () => {
    const formatted = formatPublishedAt("2026-05-18T14:42:49+09:00");

    expect(formatted).toContain("2026");
    expect(formatted).toContain("05");
    expect(formatted).toContain("18");
  });

  it("잘못된 날짜는 대체 문구를 반환한다", () => {
    expect(formatPublishedAt("invalid")).toBe("발행 시간 확인 불가");
  });
});
