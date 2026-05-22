import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="border-b border-[#d8dee8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 tracking-normal text-[#111827]">
            <span className="h-5 w-1.5 rounded-sm bg-[#b42318]" aria-hidden="true" />
            <span className="text-base font-bold">News Pulse</span>
          </Link>
          <span className="hidden text-xs font-medium text-[#6b7280] sm:inline">RSS 뉴스</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-7">
        <Outlet />
      </main>
    </div>
  );
}
