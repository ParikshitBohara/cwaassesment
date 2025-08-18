"use client";

export default function HomePage() {
  return (
    <div className="grid w-full grid-cols-12 gap-4 md:gap-6">
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
  );
}
