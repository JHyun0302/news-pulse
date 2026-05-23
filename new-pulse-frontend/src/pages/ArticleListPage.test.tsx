import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import { ArticleListPage } from "./ArticleListPage";

function article(articleId: string, title: string) {
  return {
    articleId,
    title,
    link: `https://www.yna.co.kr/view/${articleId}`,
    creator: "김기자",
    publishedAt: "2026-05-18T14:42:49+09:00",
    categories: ["POLITICS"],
    read: false
  };
}

function articlesResponse({
  items,
  totalCount = items.length,
  offset = 0,
  limit = 50,
  hasNext = false,
  nextOffset = null
}: {
  items: ReturnType<typeof article>[];
  totalCount?: number;
  offset?: number;
  limit?: number;
  hasNext?: boolean;
  nextOffset?: number | null;
}) {
  return {
    category: { code: "POLITICS", name: "정치" },
    items,
    page: {
      totalCount,
      limit,
      offset,
      hasNext,
      nextOffset
    }
  };
}

describe("ArticleListPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("첫 page 기사와 표시 수를 보여준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          articlesResponse({
            items: [article("AKR20260518104500055", "정치 기사")],
            totalCount: 2,
            hasNext: true,
            nextOffset: 50
          })
        )
      )
    );

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/politics",
      path: "/categories/:categorySlug"
    });

    expect(await screen.findByRole("heading", { name: "정치 최신뉴스" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /정치 기사/ })).toBeInTheDocument();
    expect(screen.getByText("전체 2건 중 1건 표시")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "새로고침" })).not.toBeInTheDocument();
  });

  it("기존 대문자 enum URL도 기사 목록을 표시한다", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        articlesResponse({
          items: [article("AKR20260518104500055", "정치 기사")]
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/POLITICS",
      path: "/categories/:categorySlug"
    });

    expect(await screen.findByRole("heading", { name: "정치 최신뉴스" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("category=POLITICS"), expect.any(Object));
  });

  it("더보기 클릭 시 다음 page 기사를 이어서 표시한다", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      const offset = Number(url.searchParams.get("offset") ?? "0");

      if (offset === 50) {
        return Response.json(
          articlesResponse({
            items: [article("AKR20260518104500056", "두 번째 정치 기사")],
            totalCount: 2,
            offset: 50,
            hasNext: false,
            nextOffset: null
          })
        );
      }

      return Response.json(
        articlesResponse({
          items: [article("AKR20260518104500055", "첫 번째 정치 기사")],
          totalCount: 2,
          offset: 0,
          hasNext: true,
          nextOffset: 50
        })
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/politics",
      path: "/categories/:categorySlug"
    });

    expect(await screen.findByRole("link", { name: /첫 번째 정치 기사/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "더보기" }));

    expect(await screen.findByRole("link", { name: /두 번째 정치 기사/ })).toBeInTheDocument();
    expect(screen.getByText("전체 2건 중 2건 표시")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
    expect(screen.getByText("전체 2건 표시 완료")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("offset=50"), expect.any(Object));
  });

  it("다음 page가 없으면 더보기 버튼을 표시하지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          articlesResponse({
            items: [article("AKR20260518104500055", "정치 기사")],
            totalCount: 1,
            hasNext: false,
            nextOffset: null
          })
        )
      )
    );

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/politics",
      path: "/categories/:categorySlug"
    });

    expect(await screen.findByRole("link", { name: /정치 기사/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
    expect(screen.getByText("전체 1건 표시 완료")).toBeInTheDocument();
  });

  it("빈 기사 목록 상태를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          articlesResponse({
            items: [],
            totalCount: 0
          })
        )
      )
    );

    renderWithProviders(<ArticleListPage />, {
      route: "/categories/politics",
      path: "/categories/:categorySlug"
    });

    expect(await screen.findByText("표시할 기사가 없습니다")).toBeInTheDocument();
  });

  it("잘못된 카테고리 코드를 거부한다", () => {
    renderWithProviders(<ArticleListPage />, {
      route: "/categories/unknown",
      path: "/categories/:categorySlug"
    });

    expect(screen.getByText("알 수 없는 카테고리")).toBeInTheDocument();
  });
});
