import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import { ArticleDetailPage } from "./ArticleDetailPage";

describe("ArticleDetailPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("상세 진입 시 기사 메타데이터를 표시하고 읽음 API를 호출한다", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "POST") {
        return Response.json({
          articleId: "AKR20260518104500055",
          clientId: "test-client",
          read: true,
          readAt: "2026-05-21T10:15:30+09:00"
        });
      }

      if (url.startsWith("/api/articles/AKR20260518104500055")) {
        return Response.json({
          articleId: "AKR20260518104500055",
          title: "상세 기사",
          link: "https://www.yna.co.kr/view/AKR20260518104500055",
          creator: "김기자",
          publishedAt: "2026-05-18T14:42:49+09:00",
          categories: ["POLITICS"],
          read: false
        });
      }

      return Response.json({ code: "NOT_FOUND", message: "not found", timestamp: "" }, { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<ArticleDetailPage />, {
      route: "/articles/AKR20260518104500055",
      path: "/articles/:articleId"
    });

    expect(await screen.findByRole("heading", { name: "상세 기사" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "연합뉴스 원문 보기" })).toHaveAttribute(
      "href",
      "https://www.yna.co.kr/view/AKR20260518104500055"
    );
    expect(screen.getByRole("link", { name: "목록으로" })).toHaveAttribute("href", "/categories/politics");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/articles/AKR20260518104500055/read",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("상세 조회 오류 상태를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Response.json({ code: "FAIL", message: "read failed", timestamp: "" }, { status: 500 });
        }

        return Response.json({ code: "FAIL", message: "상세 오류", timestamp: "" }, { status: 500 });
      })
    );

    renderWithProviders(<ArticleDetailPage />, {
      route: "/articles/AKR20260518104500055",
      path: "/articles/:articleId"
    });

    expect(await screen.findByText("상세 오류")).toBeInTheDocument();
  });
});
