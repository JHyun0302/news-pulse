import { Link, NavLink, Outlet } from "react-router-dom";
import { CATEGORY_CODES } from "../types/api";
import { getCategoryLabel } from "../utils/category";

export function AppShell() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="border-b border-[#d8dee8] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-11 items-center justify-between gap-4 border-b border-[#edf0f5]">
            <Link to="/" className="flex shrink-0 items-center gap-2 tracking-normal text-[#111827]">
              <span className="h-5 w-1.5 rounded-sm bg-[#b42318]" aria-hidden="true" />
              <span className="text-base font-bold">News Pulse</span>
            </Link>
            <span className="hidden text-xs font-medium text-[#6b7280] sm:inline">RSS 뉴스 포털</span>
          </div>
          <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="뉴스 카테고리">
            <div className="flex min-w-max items-center gap-1 py-2">
              {CATEGORY_CODES.map((categoryCode) => (
                <NavLink
                  key={categoryCode}
                  to={`/categories/${categoryCode}`}
                  className={({ isActive }) =>
                    `inline-flex h-8 items-center border-b-2 px-3 text-sm font-semibold ${
                      isActive
                        ? "border-[#b42318] text-[#b42318]"
                        : "border-transparent text-[#374151] hover:border-[#c7cdd6] hover:text-[#111827]"
                    }`
                  }
                >
                  {getCategoryLabel(categoryCode)}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-5">
        <Outlet />
      </main>
    </div>
  );
}
