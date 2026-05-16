"use client";

import Link from "next/link";
import { Menu, Settings, CheckSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const { selectedBusiness, setSidebarOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 lg:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-ghost p-2 -ml-2"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Center: logo or business name */}
        <div className="flex items-center gap-2">
          {selectedBusiness ? (
            <>
              <span
                className="w-6 h-6 rounded-lg shrink-0"
                style={{ backgroundColor: selectedBusiness.color || "#7C3AED" }}
              />
              <span className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[160px]">
                {selectedBusiness.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
                <CheckSquare size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                TaskFlow
              </span>
            </>
          )}
        </div>

        {/* Right: settings */}
        <Link href="/settings" className="btn-ghost p-2 -mr-2">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
