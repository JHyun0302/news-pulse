export const CATEGORY_CODES = [
  "POLITICS",
  "NORTH_KOREA",
  "ECONOMY",
  "INDUSTRY",
  "SOCIETY"
] as const;

export type CategoryCode = (typeof CATEGORY_CODES)[number];

export interface CategorySummary {
  code: CategoryCode;
  name: string;
  articleCount: number;
  unreadCount: number;
}

export interface CategoriesResponse {
  items: CategorySummary[];
}

export interface CategoryRef {
  code: CategoryCode;
  name: string;
}

export interface ArticleSummary {
  articleId: string;
  title: string;
  link: string;
  creator: string | null;
  publishedAt: string;
  categories: CategoryCode[];
  read: boolean;
}

export interface ArticlePageMetadata {
  totalCount: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  nextOffset: number | null;
}

export interface ArticlesResponse {
  category: CategoryRef;
  items: ArticleSummary[];
  page: ArticlePageMetadata;
}

export type ArticleDetail = ArticleSummary;

export interface ReadStateResponse {
  articleId: string;
  clientId: string;
  read: boolean;
  readAt: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}
