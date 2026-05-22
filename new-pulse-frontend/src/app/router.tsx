import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ArticleDetailPage } from "../pages/ArticleDetailPage";
import { ArticleListPage } from "../pages/ArticleListPage";
import { CategoryOverviewPage } from "../pages/CategoryOverviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <CategoryOverviewPage />
      },
      {
        path: "categories/:categoryCode",
        element: <ArticleListPage />
      },
      {
        path: "articles/:articleId",
        element: <ArticleDetailPage />
      }
    ]
  }
]);
