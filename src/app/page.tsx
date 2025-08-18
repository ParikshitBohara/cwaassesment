"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  // UI-only dark mode (no persistence yet)
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  return (
    <main className="min-h-screen w-full bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      {/* Page wrapper = full width + footer pinned to bottom */}
      <div className="flex min-h-screen w-full flex-col px-6 py-4 md:px-8 lg:px-12">

        {/* === Top bar === */}
        <div className="rounded border border-neutral-300 bg-white/70 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/70">
          <div className="grid grid-cols-3 items-center">
            {/* Per brief: Student Number top-left on each page */}
            <div className="text-sm font-semibold">Student No.</div>
            <h1 className="text-center text-lg font-semibold">Title</h1>

            <div className="flex items-center justify-end gap-4">
              <a href="/about" className="text-sm underline-offset-4 hover:underline">
                About
              </a>

              {/* Hamburger (static for now). We’ll animate it in Week 3 */}
              <button aria-label="Open menu" className="group relative h-6 w-8">
                <span className="absolute left-0 top-1 block h-0.5 w-8 bg-current transition-transform group-hover:translate-x-0.5" />
                <span className="absolute left-0 top-1/2 block h-0.5 w-8 -translate-y-1/2 bg-current" />
                <span className="absolute bottom-1 left-0 block h-0.5 w-8 bg-current transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* === Nav row === */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 pb-2 dark:border-neutral-700">
          <nav aria-label="Primary" className="text-sm">
            <span className="mr-2 inline-block rounded border border-neutral-400 bg-neutral-200 px-2 py-0.5 dark:border-neutral-600 dark:bg-neutral-700">
              Tabs
            </span>
            <span className="mr-2 border-r border-neutral-400 pr-2 dark:border-neutral-600">
              Pre-lab Questions
            </span>
            <span className="mr-2 border-r border-neutral-400 pr-2 dark:border-neutral-600">
              Escape Room
            </span>
            <span>Coding Races</span>
          </nav>

          {/* Dark mode toggle (UI only) */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(v => !v)}
              className="h-4 w-4 accent-current"
            />
            Dark Mode
          </label>
        </div>

        {/* === Main content grid === */}
        <div className="mt-6 grid w-full grid-cols-12 gap-4 md:gap-6">
          {/* Tabs headers */}
          <section className="col-span-12 md:col-span-3">
            <h2 className="mb-2 text-base font-semibold">Tabs</h2>

            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="font-medium">Tabs Headers:</span>
              <button
                type="button"
                title="Add tab"
                aria-label="Add tab"
                className="inline-flex h-6 w-6 items-center justify-center rounded border border-neutral-400 bg-neutral-200 hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                +
              </button>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="text-center">Step 1</li>
              <li className="text-center">
                <span className="inline-block rounded border border-neutral-400 bg-neutral-200 px-3 py-1 dark:border-neutral-600 dark:bg-neutral-700">
                  Step 2
                </span>
              </li>
              <li className="text-center">Step 3</li>
            </ul>
          </section>

          {/* Tabs content */}
          <section className="col-span-12 md:col-span-4">
            <h2 className="mb-2 text-base font-semibold">Tabs Content</h2>

            <div className="rounded border border-neutral-300 bg-white p-3 text-sm leading-6 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="font-medium">Step 2:</p>
              <ol className="ml-4 list-decimal">
                <li>Install VSCode</li>
                <li>Install Chrome</li>
                <li>Install Node</li>
                <li>etc</li>
              </ol>
            </div>
          </section>

          {/* Output + code preview */}
          <section className="col-span-12 md:col-span-5">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded border border-neutral-400 bg-neutral-200 px-4 py-1 text-sm hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                Output
              </button>
            </div>

            <div className="rounded border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">
{`<!-- sample generated code (preview) -->
<div style="display:flex;gap:8px;">
  <button style="padding:6px 10px;border:1px solid #ccc;">Tab 1</button>
  <button style="padding:6px 10px;border:1px solid #ccc;">Tab 2</button>
</div>
<script>
  // tabs JS would go here
</script>`}
              </pre>
            </div>
          </section>
        </div>

        {/* Divider */}
        <div className="my-6 h-0.5 w-full rounded bg-neutral-300 dark:bg-neutral-700" />

        {/* Footer sticks to bottom via mt-auto on short pages */}
        <footer className="mt-auto py-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
          Copyright Name, Student No, Date
        </footer>
      </div>
    </main>
  );
}
