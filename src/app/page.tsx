"use client";

import { useMemo, useState } from "react";

type TabDef = { id: string; label: string; content: string };
const uid = () => Math.random().toString(36).slice(2, 9);

function generateInlineTabsHTML(tabs: TabDef[]) {
  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tabs Output</title>
<!-- All inline CSS + vanilla JS (no CSS classes) -->

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
    ${t.content || '<p style="margin:0;color:#555">No content.</p>'}
  </div>
`).join("")}

<script>
  // cookie helpers
  function setCookie(name, value, days) {
    var d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + d.toUTCString() + "; path=/";
  }
  function getCookie(name) {
    var m = document.cookie.split('; ').find(function (p){ return p.indexOf(name + '=') === 0; });
    return m ? decodeURIComponent(m.split('=')[1]) : "";
  }

  var TAB_COOKIE = "active_tab_panel_id";
  function openTab(evt, panelId) {
    var panels = document.querySelectorAll('[role="tabpanel"]');
    for (var i=0;i<panels.length;i++){ panels[i].hidden = true; panels[i].style.display = "none"; }
    var tabs = document.querySelectorAll('[role="tab"]');
    for (var j=0;j<tabs.length;j++){ tabs[j].setAttribute('aria-selected','false'); tabs[j].style.background = '#f9f9f9'; }
    var panel = document.getElementById(panelId);
    if (panel){ panel.hidden = false; panel.style.display = 'block'; }
    if (evt && evt.currentTarget){ evt.currentTarget.setAttribute('aria-selected','true'); evt.currentTarget.style.background = '#fff'; }
    setCookie(TAB_COOKIE, panelId, 30);
  }

  // restore last tab
  (function(){
    var saved = getCookie(TAB_COOKIE);
    if (saved) {
      var btn = document.querySelector('[aria-controls="'+saved+'"]');
      if (btn) openTab({currentTarget:btn}, saved);
    }
    // keyboard nav
    document.addEventListener('keydown', function(e){
      var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      var current = tabs.findIndex(function(t){ return t.getAttribute('aria-selected')==='true'; });
      if (e.key === 'ArrowRight'){ e.preventDefault(); var n=(current+1)%tabs.length; tabs[n].click(); tabs[n].focus(); }
      if (e.key === 'ArrowLeft'){ e.preventDefault(); var p=(current-1+tabs.length)%tabs.length; tabs[p].click(); tabs[p].focus(); }
      if (e.key === 'Home'){ e.preventDefault(); tabs[0].click(); tabs[0].focus(); }
      if (e.key === 'End'){ e.preventDefault(); var last=tabs.length-1; tabs[last].click(); tabs[last].focus(); }
    });
  })();
</script>
</html>`;
  return html;
}

export default function HomePage() {
  const [tabs, setTabs] = useState<TabDef[]>([
    { id: uid(), label: "1. Setup", content: "<h3 style='margin:0 0 8px 0;font:600 18px/1.3 system-ui;'>Setup</h3><ul style='margin:0 0 0 18px;padding:0 0 0 2px;'><li>Make sure you have VSCode installed.</li><li>Watch and follow the video.</li></ul>" },
    { id: uid(), label: "2. Terminal Commands", content: "<h3 style='margin:0 0 8px 0;font:600 18px/1.3 system-ui;'>Terminal Commands</h3><pre style='margin:0;background:#f8f8f8;border:1px solid #aaa;padding:10px;overflow:auto;font:13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;'>sudo dnf install httpd\nsudo systemctl enable --now httpd.service\nsudo firewall-cmd --add-service=http --permanent\nsudo firewall-cmd --reload</pre>" },
    { id: uid(), label: "3. Index.html", content: "<h3 style='margin:0 0 8px 0;font:600 18px/1.3 system-ui;'>create /var/www/html/index.html</h3><pre style='margin:0;background:#f8f8f8;border:1px solid #aaa;padding:10px;overflow:auto;font:13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;'>&lt;!DOCTYPE html&gt;\n&lt;html lang='en'&gt;...&lt;/html&gt;</pre>" },
  ]);
  const [active, setActive] = useState(0);

  const output = useMemo(() => generateInlineTabsHTML(tabs), [tabs]);

  // helpers
  const addTab = () =>
    setTabs((prev) => [...prev, { id: uid(), label: `Tab ${prev.length + 1}`, content: "" }]);
  const removeTab = (i: number) =>
    setTabs((prev) => prev.filter((_, idx) => idx !== i).map((t) => t));
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
          >
            +
          </button>
        </div>

        <ul className="space-y-3 text-sm">
          {tabs.map((t, i) => (
            <li key={t.id} className="text-center">
              <button
                onClick={() => setActive(i)}
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
                    ×
                  </button>
                </span>
              </button>
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
              placeholder="Write HTML for this tab (allowed). Inline styles recommended."
              value={tabs[active].content}
              onChange={(e) => updateContent(active, e.target.value)}
            />
            <div className="mt-2 rounded border p-3">
              <p className="mb-2 text-xs text-theme-secondary">Live preview</p>
              <div dangerouslySetInnerHTML={{ __html: tabs[active].content || "<p style='margin:0;color:#666'>No content.</p>" }} />
            </div>
          </div>
        ) : (
          <div className="card">No tabs. Add one!</div>
        )}
      </section>

      {/* Output + code preview */}
      <section className="col-span-12 md:col-span-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(output); }}
              className="rounded-lg border border-theme-primary bg-theme-elevated px-6 py-2 text-sm text-theme-primary hover:bg-theme-secondary transition-all duration-200 hover:scale-105"
            >
              Copy Output
            </button>
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
