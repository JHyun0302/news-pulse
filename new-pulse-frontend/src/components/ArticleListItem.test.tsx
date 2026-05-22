import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ArticleListItem } from "./ArticleListItem";

const article = {
  articleId: "AKR20260518104500055",
  title: "테스트 기사 제목",
  link: "https://www.yna.co.kr/view/AKR20260518104500055",
  creator: "김기자",
  publishedAt: "2026-05-18T14:42:49+09:00",
  categories: ["POLITICS" as const],
  read: false
};

describe("ArticleListItem", () => {
  it("미읽음 기사 제목, 작성자, 발행 시간을 표시한다", () => {
    render(
      <MemoryRouter>
        <ArticleListItem article={article} categoryCode="POLITICS" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /테스트 기사 제목/ })).toHaveAttribute(
      "href",
      "/articles/AKR20260518104500055"
    );
    expect(screen.getByText("미읽음")).toBeInTheDocument();
    expect(screen.getByText("김기자")).toBeInTheDocument();
    expect(screen.getByText(/오후 02:42/)).toBeInTheDocument();
  });
});
