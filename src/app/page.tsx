"use client";

import { useMemo, useRef, useState, useEffect } from "react";

type TabDef = { id: string; label: string; content: string };

const START_TABS: TabDef[] = [
  { id: "t1", label: "1. Setup",              content: "" },
  { id: "t2", label: "2. Terminal Commands",  content: "" },
  { id: "t3", label: "3. Index.html",         content: "" },
];

const STORAGE_KEY = "tabs_builder_state_v1";

function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
function renderUserContent(raw: string) {
  const v = (raw ?? "").trimEnd();
  if (v === "") return "";
  const looksLikeHTML = /<\s*[a-z!]/i.test(v.trim());
  return looksLikeHTML
    ? v
    : `<p style="margin:0;white-space:pre-wrap;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">${escapeHTML(v)}</p>`;
}

function generateInlineTabsHTML(tabs: TabDef[]) {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tabs Output</title>
</head>
<body style="margin:16px;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">

<div role="tablist" aria-label="Tabs"
     style="overflow:hidden;border:1px solid #ccc;background:#f1f1f1;display:flex;gap:6px;flex-wrap:wrap;padding:8px;">
  ${tabs.map((t, i) => `
    <button role="tab" aria-selected="${i===0?'true':'false'}" aria-controls="panel-${t.id}" id="tab-${t.id}"
            onclick="openTab(event,'panel-${t.id}')"
            style="border:1px solid #ccc;background:${i===0?'#fff':'#f9f9f9'};padding:10px 14px;cursor:pointer;border-radius:8px 8px 0 0;font:14px/1.1 system-ui;">${t.label}</button>
  `).join("")}
</div>

${tabs.map((t, i) => `
  <div id="panel-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" ${i===0?"":"hidden"}
       style="display:${i===0?"block":"none"};padding:12px;border:1px solid #ccc;border-top:none;font:15px/1.5 system-ui;">
    ${renderUserContent(t.content || "")}
  </div>
`).join("")}

<script>
  function openTab(evt, panelId) {
    var panels = document.querySelectorAll('[role="tabpanel"]');
    for (var i=0;i<panels.length;i++){
      panels[i].hidden = true;
      panels[i].style.display = "none";
    }
    var tabs = document.querySelectorAll('[role="tab"]');
    for (var j=0;j<tabs.length;j++){
      tabs[j].setAttribute('aria-selected','false');
      tabs[j].style.background = '#f9f9f9';
    }
    var panel = document.getElementById(panelId);
    if (panel){ panel.hidden = false; panel.style.display = 'block'; }
    if (evt && evt.currentTarget){
      evt.currentTarget.setAttribute('aria-selected','true');
      evt.currentTarget.style.background = '#fff';
    }
  }

  (function(){
    document.addEventListener('keydown', function(e){
      var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      var current = tabs.findIndex(function(t){ return t.getAttribute('aria-selected')==='true'; });
      if (e.key === 'ArrowRight'){
        e.preventDefault();
        var n=(current+1)%tabs.length;
        tabs[n].click();
        tabs[n].focus();
      }
      if (e.key === 'ArrowLeft'){
        e.preventDefault();
        var p=(current-1+tabs.length)%tabs.length;
        tabs[p].click();
        tabs[p].focus();
      }
      if (e.key === 'Home'){
        e.preventDefault();
        tabs[0].click();
        tabs[0].focus();
      }
      if (e.key === 'End'){
        e.preventDefault();
        var last=tabs.length-1;
        tabs[last].click();
        tabs[last].focus();
      }
    });
  })();
</script>
</body></html>`;
  return html;
}

export default function HomePage() {
  // deterministic initial state
  const [tabs, setTabs] = useState<TabDef[]>(START_TABS);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false); // <-- for "Copied!" notice

  // Persist builder state to localStorage (builder only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(t => t && typeof t.id === "string")) {
          const loaded = parsed as TabDef[];
          setTabs(loaded);
          // align idCounter with highest number suffix
          const maxNum =
            loaded
              .map(t => /^t(\d+)$/.exec(t.id)?.[1])
              .filter(Boolean)
              .map(n => parseInt(n as string, 10))
              .reduce((a, b) => Math.max(a, b), START_TABS.length) || START_TABS.length;
          idCounter.current = Math.max(idCounter.current, maxNum + 1);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch {}
  }, [tabs]);

  // client-only id counter for new tabs
  const idCounter = useRef(START_TABS.length + 1);
  const nextId = (existing: TabDef[]) => {
    const used = new Set(existing.map(t => t.id));
    let candidate = `t${idCounter.current}`;
    while (used.has(candidate)) {
      idCounter.current += 1;
      candidate = `t${idCounter.current}`;
    }
    idCounter.current += 1;
    return candidate;
  };

  const output = useMemo(() => generateInlineTabsHTML(tabs), [tabs]);

  const addTab = () =>
    setTabs((prev) => [...prev, { id: nextId(prev), label: `Tab ${prev.length + 1}`, content: "" }]);
  const removeTab = (i: number) =>
    setTabs((prev) => prev.filter((_, idx) => idx !== i));
  const updateLabel = (i: number, v: string) =>
    setTabs((prev) => prev.map((t, idx) => (idx === i ? { ...t, label: v } : t)));
  const updateContent = (i: number, v: string) =>
    setTabs((prev) => prev.map((t, idx) => (idx === i ? { ...t, content: v } : t)));

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
            onClick={() => { addTab(); setActive(tabs.length); }}
            disabled={tabs.length >= 15}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border 
              border-theme-primary bg-theme-elevated text-theme-primary 
              hover:bg-theme-secondary transition-all duration-200 hover:scale-105
              ${tabs.length >= 15 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            +
          </button>
        </div>

        <ul className="space-y-3 text-sm">
          {tabs.map((t, i) => (
            <li key={t.id} className="text-center">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActive(i);
                }}
                className={`inline-flex items-center justify-between w-full rounded-lg px-3 py-2 transition-colors duration-200 ${
                  i === active
                    ? "border border-theme-accent bg-theme-accent text-theme-primary font-medium shadow-sm"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                <input
                  aria-label={`Label for tab ${i + 1}`}
                  value={t.label}
                  onChange={(e) => updateLabel(i, e.target.value)}
                  className="bg-transparent outline-none w-full"
                />
                <span className="ml-2 inline-flex gap-2">
                  <button
                    type="button"
                    title="Remove tab"
                    aria-label={`Remove tab ${i + 1}`}
                    onClick={() => {
                      removeTab(i);
                      if (active >= i && active > 0) setActive(active - 1);
                    }}
                    className="rounded border px-2 text-xs"
                  >
                    x
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tabs content (editor + live preview) */}
      <section className="col-span-12 md:col-span-4">
        <h2 className="mb-4 text-xl font-semibold text-theme-primary">Tabs Content</h2>

        {tabs[active] ? (
          <div className="card space-y-3">
            <p className="font-medium text-theme-primary">
              Editing: <span className="opacity-80">{tabs[active].label}</span>
            </p>
            <textarea
              className="w-full min-h-56 rounded border p-3 text-sm"
              placeholder="Type text or HTML. We'll display exactly what you put in (no auto‑format)."
              value={tabs[active].content}
              onChange={(e) => updateContent(active, e.target.value)}
            />
            <div className="mt-2 rounded border p-3">
              <p className="mb-2 text-xs text-theme-secondary">Live preview</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderUserContent(tabs[active].content || ""),
                }}
              />
            </div>
          </div>
        ) : (
          <div className="card">No tabs. Add one!</div>
        )}
      </section>

      {/* Output + code preview */}
      <section className="col-span-12 md:col-span-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(output);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg border border-theme-primary bg-theme-elevated px-6 py-2 text-sm text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
              aria-describedby="copy-status"
            >
              Copy Output
            </button>

            <span
              id="copy-status"
              role="status"
              aria-live="polite"
              className={`text-xs ${copied ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
            >
              {copied ? "Copied!" : "\u00A0"}
            </span>

            <a
              className="rounded-lg border border-theme-primary bg-theme-elevated px-6 py-2 text-sm text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
              href={`data:text/html;charset=utf-8,${encodeURIComponent(output)}`}
              download="Hello.html"
            >
              Download Hello.html
            </a>
          </div>
        </div>

        <div className="card">
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-theme-secondary font-mono">
{output}
          </pre>
        </div>
      </section>
    </div>
  );
}
