import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CategoryCard } from "./CategoryCard";

describe("CategoryCard", () => {
  it("카테고리명과 기사 수를 표시하고 목록 링크를 제공한다", () => {
    render(
      <MemoryRouter>
        <CategoryCard
          category={{
            code: "POLITICS",
            name: "정치",
            articleCount: 42,
            unreadCount: 17
          }}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: "정치 기사 목록 보기" });
    expect(link).toHaveAttribute("href", "/categories/POLITICS");
    expect(screen.getByText("정치")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
  });
});
