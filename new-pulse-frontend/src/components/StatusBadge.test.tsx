import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("미읽음 상태를 텍스트로 표시한다", () => {
    render(<StatusBadge variant="unread" />);

    expect(screen.getByText("미읽음")).toBeInTheDocument();
  });

  it("읽음 상태를 텍스트로 표시한다", () => {
    render(<StatusBadge variant="read" />);

    expect(screen.getByText("읽음")).toBeInTheDocument();
  });
});
