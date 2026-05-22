import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import { ArticleListPage } from "./ArticleListPage";

describe("ArticleListPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("기사 목록을 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          category: { code: "POLITICS", name: "정치" },
          items: [
            {
              articleId: "AKR20260518104500055",
              title: "정치 기사",
              link: "https://www.yna.co.kr/view/AKR20260518104500055",
              creator: "김기자",
              publishedAt: "2026-05-18T14:42:49+09:00",
              categories: ["POLITICS"],
              read: false
            }
          ]
        })
      )
    );

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/POLITICS",
      path: "/categories/:categoryCode"
    });

    expect(await screen.findByRole("heading", { name: "정치 최신뉴스" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /정치 기사/ })).toBeInTheDocument();
  });

  it("빈 기사 목록 상태를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          category: { code: "POLITICS", name: "정치" },
          items: []
        })
      )
    );

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/POLITICS",
      path: "/categories/:categoryCode"
    });

    expect(await screen.findByText("표시할 기사가 없습니다")).toBeInTheDocument();
  });

  it("잘못된 카테고리 코드를 거부한다", () => {
    renderWithProviders(<ArticleListPage />, {
      route: "/categories/UNKNOWN",
      path: "/categories/:categoryCode"
    });

    expect(screen.getByText("알 수 없는 카테고리")).toBeInTheDocument();
  });
});
