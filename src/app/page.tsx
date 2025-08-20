"use client";

export default function HomePage() {
  return (
    <div className="grid w-full grid-cols-12 gap-4 md:gap-6 animate-fade-in">
      {/* Tabs headers */}
      <section className="col-span-12 md:col-span-3">
        <h2 className="mb-4 text-xl font-semibold text-theme-primary">Tabs</h2>

        <div className="mb-4 flex items-center gap-3 text-sm">
          <span className="font-medium text-theme-secondary">Tabs Headers:</span>
          <button
            type="button"
            title="Add tab"
            aria-label="Add tab"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
          >
            +
          </button>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="text-center">
            <span className="inline-block rounded-lg px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors duration-200">
              Step 1
            </span>
          </li>
          <li className="text-center">
            <span className="inline-block rounded-lg border border-theme-accent bg-theme-accent px-4 py-2 text-theme-primary font-medium shadow-sm">
              Step 2
            </span>
          </li>
          <li className="text-center">
            <span className="inline-block rounded-lg px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors duration-200">
              Step 3
            </span>
          </li>
        </ul>
      </section>

      {/* Tabs content */}
      <section className="col-span-12 md:col-span-4">
        <h2 className="mb-4 text-xl font-semibold text-theme-primary">Tabs Content</h2>

        <div className="card">
          <p className="font-medium text-theme-primary mb-3">Step 2:</p>
          <ol className="ml-4 list-decimal space-y-1 text-theme-secondary">
            <li>Install VSCode</li>
            <li>Install Chrome</li>
            <li>Install Node</li>
            <li>etc</li>
          </ol>
        </div>
      </section>

      {/* Output + code preview */}
      <section className="col-span-12 md:col-span-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg border border-theme-primary bg-theme-elevated px-6 py-2 text-sm text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
          >
            Output
          </button>
        </div>

        <div className="card">
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-theme-secondary font-mono">
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
