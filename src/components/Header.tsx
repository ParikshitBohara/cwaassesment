"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  studentNo: string;
  title?: string;
};

// Simple UI-only dark mode (persistence can come later)
export default function Header({ studentNo, title = "Title" }: Props) {
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  const NAV = [
    { href: "/", label: "Tabs" },
    { href: "/escape-room", label: "Escape Room" },
    { href: "/coding-races", label: "Coding Races" },
    { href: "/court-room", label: "Court Room" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-neutral-100/80 backdrop-blur dark:bg-neutral-900/80">
      {/* Top bar */}
      <div className="px-6 py-3 md:px-8 lg:px-12">
        <div className="rounded border border-neutral-300 bg-white/70 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/70">
          <div className="grid grid-cols-3 items-center">
            <div className="text-sm font-semibold">{studentNo}</div>
            <h1 className="text-center text-lg font-semibold">{title}</h1>

            <div className="flex items-center justify-end gap-4">
              <Link href="/about" className="text-sm underline-offset-4 hover:underline">
                About
              </Link>
              {/* hamburger (static; we’ll animate later) */}
              <button aria-label="Open menu" className="group relative h-6 w-8">
                <span className="absolute left-0 top-1 block h-0.5 w-8 bg-current transition-transform group-hover:translate-x-0.5" />
                <span className="absolute left-0 top-1/2 block h-0.5 w-8 -translate-y-1/2 bg-current" />
                <span className="absolute bottom-1 left-0 block h-0.5 w-8 bg-current transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className="px-6 md:px-8 lg:px-12">
        <div className="mb-2 mt-2 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 pb-2 dark:border-neutral-700">
          <nav aria-label="Primary" className="text-sm flex flex-wrap items-center gap-2">
            {NAV.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isActive
                      ? "border border-neutral-400 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700"
                      : "hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark((v) => !v)}
              className="h-4 w-4 accent-current"
            />
            Dark Mode
          </label>
        </div>
      </div>
    </header>
  );
}
