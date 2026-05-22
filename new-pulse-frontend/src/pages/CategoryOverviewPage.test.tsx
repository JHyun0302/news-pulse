import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryOverviewPage } from "./CategoryOverviewPage";
import { renderWithProviders } from "../test/renderWithProviders";

describe("CategoryOverviewPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("카테고리 로딩 상태를 표시한다", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));

    renderWithProviders(<CategoryOverviewPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("카테고리 성공 응답을 카드 목록으로 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          items: [
            { code: "POLITICS", name: "정치", articleCount: 4, unreadCount: 2 },
            { code: "ECONOMY", name: "경제", articleCount: 3, unreadCount: 1 }
          ]
        })
      )
    );

    renderWithProviders(<CategoryOverviewPage />);

    expect(await screen.findByRole("link", { name: "정치 기사 목록 보기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "경제 기사 목록 보기" })).toBeInTheDocument();
  });

  it("카테고리 오류 상태를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ code: "FAIL", message: "서버 오류", timestamp: "" }, { status: 500 }))
    );

    renderWithProviders(<CategoryOverviewPage />);

    expect(await screen.findByText("서버 오류")).toBeInTheDocument();
  });
});
