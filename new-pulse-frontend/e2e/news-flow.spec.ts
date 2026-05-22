import { expect, type Page, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CLIENT_ID_STORAGE_KEY = "news-pulse-client-id";
const screenshotDir = path.resolve(process.cwd(), "../screenshots");

async function useFreshClientId(page: Page, clientId: string) {
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: CLIENT_ID_STORAGE_KEY, value: clientId }
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

test("카테고리에서 상세로 이동하고 읽음 상태를 반영한다", async ({ page }, testInfo) => {
  const clientId = `playwright-${Date.now()}-${testInfo.workerIndex}`;

  await useFreshClientId(page, clientId);

  await mkdir(screenshotDir, { recursive: true });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "카테고리별 RSS 뉴스 현황" })).toBeVisible();

  for (const categoryName of ["정치", "북한", "경제", "산업", "사회"]) {
    await expect(page.getByRole("link", { name: `${categoryName} 기사 목록 보기` })).toBeVisible();
  }

  await page.screenshot({
    path: path.join(screenshotDir, "category-overview.png"),
    fullPage: true
  });

  await page.getByRole("link", { name: "정치 기사 목록 보기" }).click();
  await expect(page).toHaveURL(/\/categories\/POLITICS$/);
  await expect(page.getByRole("heading", { name: "정치 최신뉴스", exact: true })).toBeVisible();

  const firstArticle = page.locator("li a").first();
  await expect(firstArticle).toBeVisible();
  await expect(firstArticle.getByText("미읽음", { exact: true })).toBeVisible();
  const articleTitle = await firstArticle.locator("h2").innerText();

  await firstArticle.click();
  await expect(page).toHaveURL(/\/articles\/[^/]+$/);
  await expect(page.locator("article h1")).toContainText(articleTitle.slice(0, 12));
  await expect(page.getByText("읽음", { exact: true })).toBeVisible();

  const originalLink = page.getByRole("link", { name: "연합뉴스 원문 보기" });
  await expect(originalLink).toBeVisible();
  await expect(originalLink).toHaveAttribute("target", "_blank");
  await expect(originalLink).toHaveAttribute("href", /^https:\/\/www\.yna\.co\.kr\/view\//);

  await page.screenshot({
    path: path.join(screenshotDir, "article-detail.png"),
    fullPage: true
  });

  await page.getByRole("link", { name: "목록으로" }).click();
  await expect(page).toHaveURL(/\/categories\/POLITICS$/);

  const readArticle = page.locator("li").filter({ hasText: articleTitle }).first();
  await expect(readArticle.getByText("읽음", { exact: true })).toBeVisible();
  await expect(page.getByText("미읽음", { exact: true }).first()).toBeVisible();

  await page.screenshot({
    path: path.join(screenshotDir, "article-list-read-state.png"),
    fullPage: true
  });
});

test("모바일 폭에서 주요 화면이 가로 넘침 없이 표시된다", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await useFreshClientId(page, `playwright-mobile-${Date.now()}-${testInfo.workerIndex}`);
  await mkdir(screenshotDir, { recursive: true });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "카테고리별 RSS 뉴스 현황" })).toBeVisible();
  await expect(page.getByRole("link", { name: "정치 기사 목록 보기" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-category-overview.png"),
    fullPage: true
  });

  await page.getByRole("link", { name: "정치 기사 목록 보기" }).click();
  await expect(page.getByRole("heading", { name: "정치 최신뉴스", exact: true })).toBeVisible();
  const mobileFirstArticle = page.locator("li a").first();
  await expect(mobileFirstArticle).toBeVisible();
  await expect(mobileFirstArticle.getByText("미읽음", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-article-list.png"),
    fullPage: true
  });

  await mobileFirstArticle.click();
  await expect(page.getByRole("link", { name: "연합뉴스 원문 보기" })).toBeVisible();
  await expect(page.getByText("읽음", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-article-detail.png"),
    fullPage: true
  });
});
