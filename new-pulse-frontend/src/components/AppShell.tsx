import { Newspaper } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#1f2933]">
      <header className="border-b border-[#d8d1c5] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-normal text-[#1f2933]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2b8a7e] text-white">
              <Newspaper aria-hidden="true" size={20} />
            </span>
            <span className="text-lg">News Pulse</span>
          </Link>
          <span className="hidden text-sm text-[#647067] sm:inline">RSS 기반 뉴스 열람</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
