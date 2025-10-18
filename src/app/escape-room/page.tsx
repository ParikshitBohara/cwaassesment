"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   Types
   ========================================================= */

type StageType = "format" | "click" | "codeRange" | "convert" | "question";

type Stage = {
  id: string;
  order: number;
  title: string;
  type: StageType;
  question?: string;       // prompt / template / csv / code line depending on type
  correctAnswer?: string;  // for "question" (and optional for others)
  hotspotX?: number;       // for "click"
  hotspotY?: number;       // for "click"
};

type Room = {
  id?: string;
  title: string;
  timer: number;
  bgImage: string;
  stages: Stage[];
  createdAt?: string;
};

/* =========================================================
   Helpers
   ========================================================= */

const uid = () => Math.random().toString(36).slice(2, 10);

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/* =========================================================
   Standalone HTML generator (all inline)
   ========================================================= */

function buildPlayableHtml(room: Room) {
  const safeTitle = escapeHtml(room.title || "Escape Room");
  const payload = JSON.stringify({
    title: room.title,
    timer: room.timer,
    bgImage: room.bgImage,
    stages: room.stages.map((s) => ({
      order: s.order,
      title: s.title,
      type: s.type,
      question: s.question ?? "",
      correctAnswer: s.correctAnswer ?? "",
      hotspotX: s.hotspotX ?? null,
      hotspotY: s.hotspotY ?? null,
    })),
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${safeTitle}</title>
<style>
:root{
  --bg:#0b0f19;--card:rgba(255,255,255,.06);--text:#f8fafc;--muted:#b8c1d4;
  --pin:#60a5fa;--ok:#22c55e;--warn:#f59e0b;--err:#ef4444;
}
html,body{height:100%}
body{
  margin:0;background:linear-gradient(120deg,#0b0f19,#111827);
  color:var(--text);font-family:system-ui,Inter,Segoe UI,Roboto,sans-serif;
  display:grid;place-items:start center
}
.wrap{width:min(1150px,96vw);padding:22px}
header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.title{font-weight:800;font-size:clamp(22px,2.6vw,32px)}
.timer{font-family:ui-monospace,Menlo,monospace;background:var(--card);padding:8px 12px;border-radius:10px}
.scene{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.08);box-shadow:0 18px 44px rgba(0,0,0,.38)}
.scene img{display:block;width:100%;height:auto}
.pin{position:absolute;transform:translate(-50%,-50%);background:var(--pin);color:#001122;
  width:30px;height:30px;border:2px solid #fff;border-radius:999px;
  display:grid;place-items:center;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.45)}
.grid{display:grid;gap:16px;margin-top:16px}
.card{background:var(--card);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px}
.card h2{margin:0 0 6px}
.muted{color:var(--muted)}
textarea,input[type="text"]{
  width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);color:var(--text);outline:none
}
button{border:0;padding:10px 14px;border-radius:10px;background:#3b82f6;color:white;font-weight:700;cursor:pointer}
button.ok{background:var(--ok)}button.warn{background:var(--warn)}button.ghost{background:#64748b}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.08)}
.okbg{background:rgba(34,197,94,.2)}.errbg{background:rgba(239,68,68,.2)}
footer{margin-top:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.disabled{opacity:.5;pointer-events:none}
pre{white-space:pre-wrap;word-break:break-word}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="title" id="title"></div>
    <div id="timer" class="timer"></div>
  </header>

  <div class="scene">
    <img id="bg" alt="Escape scene"/>
    <div id="pins"></div>
  </div>

  <div id="cards" class="grid"></div>

  <footer>
    <div id="overall" class="badge">Solve all stages to escape.</div>
    <div><button id="restart" class="ghost">Restart</button></div>
  </footer>
</div>

<script>
  const config = ${payload};
  const state = {
    secs: Math.max(0, config.timer|0),
    running: true,
    done: config.stages.map(() => false),
    current: 0,
  };

  const elTitle = document.getElementById('title');
  const elTimer = document.getElementById('timer');
  const elBg = document.getElementById('bg');
  const elPins = document.getElementById('pins');
  const elCards = document.getElementById('cards');
  const elOverall = document.getElementById('overall');
  const elRestart = document.getElementById('restart');

  elTitle.textContent = config.title || 'Escape Room';
  elBg.src = config.bgImage || '';
  elTimer.textContent = '⏳ ' + fmt(state.secs);

  function fmt(s){const m=Math.floor(s/60).toString().padStart(2,'0');const ss=(s%60).toString().padStart(2,'0');return m+':'+ss;}
  function tick(){
    if(!state.running) return;
    state.secs = Math.max(0, state.secs-1);
    elTimer.textContent = '⏳ ' + fmt(state.secs);
    if(state.secs===0){ state.running=false; alert("⏰ Time's up! Try again."); }
  }
  setInterval(tick,1000);

  // Render click pins (but show only for active "click" stage)
  function renderPins(){
    elPins.innerHTML = '';
    config.stages.forEach((s, idx)=>{
      if(s.type!=='click') return;
      const b=document.createElement('button');
      b.className='pin';
      b.textContent='🐞';
      b.style.left=(s.hotspotX||50)+'%';
      b.style.top=(s.hotspotY||50)+'%';
      b.style.display = (idx===state.current && !state.done[idx]) ? 'grid' : 'none';
      b.onclick=()=>{
        if(idx!==state.current || state.done[idx]) return;
        state.done[idx]=true;
        alert('🔧 Bug fixed!');
        advance();
      };
      elPins.appendChild(b);
    });
  }

  // Build stage cards
  function buildCards(){
    elCards.innerHTML='';
    config.stages.forEach((s, idx)=>{
      const card=document.createElement('section');
      card.className='card' + (idx===state.current? '' : ' disabled');
      const h=document.createElement('h2'); h.textContent = 'Stage '+(idx+1)+': '+s.title;
      const helper=document.createElement('div'); helper.className='muted';
      card.appendChild(h);

      const status=document.createElement('span'); status.className='badge'; status.textContent='Incomplete';

      if(s.type==='format'){
        helper.textContent='Ensure the code line ends with a semicolon.';
        const t=document.createElement('textarea'); t.rows=3; t.value=s.question||"console.log('Hello')";
        const btn=document.createElement('button'); btn.textContent='Check';
        btn.onclick=()=>{
          if(idx!==state.current || state.done[idx]) return;
          const ok = (t.value||'').trim().endsWith(';');
          status.textContent = ok?'Complete':'Incomplete';
          status.className = ok?'badge okbg':'badge';
          if(ok){ state.done[idx]=true; advance(); } else alert('❌ Missing semicolon (;)');
        };
        card.appendChild(helper); card.appendChild(t);
        card.appendChild(row(btn,status));
      }
      else if(s.type==='codeRange'){
        helper.textContent='Return an array of numbers from 0 to 1000.';
        const t=document.createElement('textarea'); t.rows=8; t.value=s.question||"const arr=[]; for(let i=0;i<=1000;i++) arr.push(i); return arr;";
        const out=document.createElement('pre'); out.className='muted';
        const btn=document.createElement('button'); btn.textContent='Run Code';
        btn.onclick=()=>{
          if(idx!==state.current || state.done[idx]) return;
          try{
            const fn = new Function(t.value);
            const res = fn();
            const ok = Array.isArray(res) && res.length===1001 && res[0]===0 && res[1000]===1000;
            status.textContent = ok?'Complete':'Incomplete';
            status.className = ok?'badge okbg':'badge';
            out.textContent = ok ? '✅ Correct array generated 0..1000' : '❌ Returned value is not a valid 0..1000 array.';
            if(ok){ state.done[idx]=true; advance(); }
          }catch(e){ alert('❌ Runtime error: '+(e&&e.message?e.message:e)); }
        };
        card.appendChild(helper); card.appendChild(t);
        card.appendChild(row(btn,status)); card.appendChild(out);
      }
      else if(s.type==='convert'){
        helper.textContent='Convert the CSV below into JSON format.';
        const t=document.createElement('textarea'); t.rows=8; t.value=s.question||"name,age\\nJohn,25\\nSarah,30";
        const out=document.createElement('pre'); out.className='muted';
        const btn=document.createElement('button'); btn.textContent='Convert'; btn.className='warn';
        btn.onclick=()=>{
          if(idx!==state.current || state.done[idx]) return;
          try{
            const lines=(t.value||'').split(/\\r?\\n/).filter(Boolean);
            const headers=lines[0].split(',');
            const arr = lines.slice(1).map(line=>{
              const vals=line.split(','); const obj={};
              headers.forEach((h,i)=>obj[h]=vals[i]);
              return obj;
            });
            out.textContent = JSON.stringify(arr,null,2);
            status.textContent='Complete'; status.className='badge okbg';
            state.done[idx]=true; advance();
          }catch(e){ alert('❌ Conversion failed.'); }
        };
        card.appendChild(helper); card.appendChild(t);
        card.appendChild(row(btn,status)); card.appendChild(out);
      }
      else if(s.type==='question'){
        helper.textContent='Answer the question correctly to proceed.';
        const p=document.createElement('div'); p.className='muted'; p.textContent=s.question||'';
        const inp=document.createElement('input'); inp.type='text'; inp.placeholder='Your answer';
        const btn=document.createElement('button'); btn.textContent='Submit';
        btn.onclick=()=>{
          if(idx!==state.current || state.done[idx]) return;
          const ans=(inp.value||'').trim();
          const key=(s.correctAnswer||'').trim();
          const ok = ans.length>0 && key.length>0 && ans.toLowerCase()===key.toLowerCase();
          status.textContent= ok?'Complete':'Incorrect';
          status.className= ok?'badge okbg':'badge';
          if(ok){ state.done[idx]=true; advance(); } else alert('❌ Incorrect answer.');
        };
        card.appendChild(p); card.appendChild(helper); card.appendChild(inp);
        card.appendChild(row(btn,status));
      }
      else if(s.type==='click'){
        helper.textContent='Click the 🐞 hotspot on the image to fix the bug.';
        card.appendChild(helper); card.appendChild(row(document.createElement('div'),status));
      }

      elCards.appendChild(card);
    });
    showOnlyCurrentCard();
  }

  function row(a,b){
    const d=document.createElement('div');
    d.style.display='flex'; d.style.gap='8px'; d.style.alignItems='center'; d.style.marginTop='8px';
    d.appendChild(a); d.appendChild(b); return d;
  }

  function showOnlyCurrentCard(){
    const kids = Array.from(elCards.children);
    kids.forEach((k, i)=>{ if(i===state.current) k.classList.remove('disabled'); else k.classList.add('disabled'); });
    renderPins();
  }

  function advance(){
    if(state.done.every(Boolean)){
      state.running=false;
      elOverall.textContent='🎉 You escaped!'; elOverall.className='badge okbg';
      alert('🎉 You escaped!');
      showOnlyCurrentCard();
      return;
    }
    // move to next incomplete
    const next = state.done.findIndex((d)=>!d);
    state.current = next===-1 ? state.current : next;
    showOnlyCurrentCard();
  }

  elRestart.onclick = ()=>{
    state.secs = Math.max(0, config.timer|0);
    state.running = true;
    state.done = config.stages.map(()=>false);
    state.current = 0;
    elOverall.textContent='Solve all stages to escape.'; elOverall.className='badge';
    buildCards(); renderPins();
  };

  // init
  buildCards(); renderPins();
</script>
</body>
</html>`;
}

/* =========================================================
   Builder UI
   ========================================================= */

export default function BuilderPage() {
  // Rooms list (left pane management)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Editor state
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("My Escape Room");
  const [timer, setTimer] = useState<number>(180);
  const [bgImage, setBgImage] = useState<string>("");

  const [stages, setStages] = useState<Stage[]>([]);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [placingFor, setPlacingFor] = useState<string | null>(null); // stage.id we are placing hotspot for

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );

  // Load existing rooms for CRUD
  const loadRooms = async () => {
    setLoadingRooms(true);
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data || []);
    setLoadingRooms(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Image → base64
  const onBgChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  // Stage operations
  function addStage(type: StageType = "question") {
    setStages((prev) => [
      ...prev,
      {
        id: uid(),
        order: prev.length,
        title: "New Stage",
        type,
        question:
          type === "format"
            ? `console.log('Hello World');`
            : type === "codeRange"
            ? `const arr = [];\nfor (let i = 0; i <= 1000; i++) arr.push(i);\nreturn arr;`
            : type === "convert"
            ? `name,age\nJohn,25\nSarah,30`
            : "",
        correctAnswer: type === "question" ? "answer" : "",
        hotspotX: type === "click" ? 62 : undefined,
        hotspotY: type === "click" ? 45 : undefined,
      },
    ]);
  }

  function updateStage(id: string, patch: Partial<Stage>) {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStage(id: string) {
    setStages((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }))
    );
  }

  function moveStage(id: string, dir: -1 | 1) {
    setStages((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      const tmp = arr[idx].order;
      arr[idx].order = arr[j].order;
      arr[j].order = tmp;
      return arr;
    });
  }

  // Place hotspot for a "click" stage
  const onSceneClick = (e: React.MouseEvent) => {
    if (!placingFor || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = +(((e.clientX - rect.left) / rect.width) * 100).toFixed(2);
    const y = +(((e.clientY - rect.top) / rect.height) * 100).toFixed(2);
    updateStage(placingFor, { hotspotX: x, hotspotY: y });
    setPlacingFor(null);
  };

  // Build a Room object from editor
  const currentRoom = useMemo<Room>(
    () => ({
      id: roomId,
      title,
      timer,
      bgImage,
      stages: sortedStages,
    }),
    [roomId, title, timer, bgImage, sortedStages]
  );

  const readyToExport = useMemo(
    () =>
      !!bgImage &&
      timer > 0 &&
      sortedStages.length > 0 &&
      sortedStages.every((s) => s.title.trim()),
    [bgImage, timer, sortedStages]
  );

  // CRUD actions
  async function saveNew() {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentRoom),
    });
    if (!res.ok) return alert("❌ Save failed");
    const data = await res.json();
    setRoomId(data.id);
    alert("✅ Saved");
    loadRooms();
  }

  async function updateExisting() {
    if (!roomId) return saveNew();
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentRoom),
    });
    if (!res.ok) return alert("❌ Update failed");
    alert("✅ Updated");
    loadRooms();
  }

  async function deleteExisting(id?: string) {
    const target = id ?? roomId;
    if (!target) return;
    if (!confirm("Delete this room?")) return;
    const res = await fetch(`/api/rooms/${target}`, { method: "DELETE" });
    if (!res.ok) return alert("❌ Delete failed");
    if (target === roomId) {
      // clear editor
      setRoomId(undefined);
      setTitle("My Escape Room");
      setTimer(180);
      setBgImage("");
      setStages([]);
    }
    loadRooms();
  }

  async function loadRoom(id: string) {
    const res = await fetch(`/api/rooms/${id}`);
    if (!res.ok) return alert("❌ Load failed");
    const data: Room = await res.json();
    setRoomId(data.id);
    setTitle(data.title);
    setTimer(data.timer);
    setBgImage(data.bgImage);
    setStages(
      (data.stages || []).map((s) => ({
        id: s.id || uid(),
        order: s.order,
        title: s.title,
        type: s.type as StageType,
        question: s.question || "",
        correctAnswer: s.correctAnswer || "",
        hotspotX: s.hotspotX ?? undefined,
        hotspotY: s.hotspotY ?? undefined,
      }))
    );
  }

  // Export / Preview
  function downloadExport() {
    if (!readyToExport) return alert("Upload background and add at least one stage.");
    const html = buildPlayableHtml(currentRoom);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function previewExport() {
    if (!readyToExport) return alert("Upload background and add at least one stage.");
    const html = buildPlayableHtml(currentRoom);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen p-6 text-white" style={{ background: "linear-gradient(120deg,#0b0f19,#111827)" }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Left: Rooms list / actions */}
        <aside className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h2 className="font-bold mb-3">Saved Rooms</h2>
          <button
            onClick={loadRooms}
            className="w-full mb-3 px-3 py-2 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50"
            disabled={loadingRooms}
          >
            {loadingRooms ? "Loading…" : "Refresh"}
          </button>

          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {rooms.length === 0 && <p className="text-sm opacity-70">No rooms yet.</p>}
            {rooms.map((r) => (
              <div key={r.id} className="p-2 rounded bg-white/10 border border-white/10">
                <div className="font-semibold text-sm truncate">{r.title}</div>
                <div className="text-xs opacity-70">{new Date(r.createdAt ?? "").toLocaleString()}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => loadRoom(r.id!)} className="px-2 py-1 bg-blue-600 rounded text-sm">
                    Edit
                  </button>
                  <button onClick={() => deleteExisting(r.id!)} className="px-2 py-1 bg-rose-600 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-4 border-white/10" />

          <div className="space-y-2">
            <button onClick={saveNew} className="w-full px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500">
              💾 Save New
            </button>
            <button
              onClick={updateExisting}
              disabled={!roomId}
              className="w-full px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
            >
              ⟳ Update
            </button>
            <button
              onClick={() => deleteExisting()}
              disabled={!roomId}
              className="w-full px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
            >
              🗑 Delete
            </button>
          </div>
        </aside>

        {/* Right: Editor */}
        <section>
          <header className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-sm opacity-80">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded bg-white/10 outline-none"
                  placeholder="My Escape Room"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm opacity-80">Timer (seconds)</span>
                <input
                  type="number"
                  min={10}
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="px-3 py-2 rounded bg-white/10 outline-none"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm opacity-80">Background image</span>
                <input type="file" accept="image/*" onChange={onBgChange} />
              </label>
            </div>
          </header>

          {/* Scene preview & hotspot placement */}
          <div
            ref={sceneRef}
            onClick={onSceneClick}
            className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/10 mt-4"
            style={{ minHeight: 320 }}
          >
            {!bgImage ? (
              <div className="grid place-items-center h-64 text-slate-300">Upload a background image to preview</div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImage} alt="scene" className="w-full h-auto block select-none" />
                {/* show all click hotspots */}
                {sortedStages
                  .filter((s) => s.type === "click" && s.hotspotX != null && s.hotspotY != null)
                  .map((s) => (
                    <div
                      title={s.title}
                      key={s.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 bg-blue-400 text-black border-2 border-white/80 rounded-full w-8 h-8 grid place-items-center font-bold shadow"
                      style={{ left: `${s.hotspotX}%`, top: `${s.hotspotY}%` }}
                    >
                      🐞
                    </div>
                  ))}
                {placingFor && (
                  <div className="absolute inset-3 grid place-items-start">
                    <div className="px-3 py-1 rounded bg-amber-500 text-black font-semibold shadow">
                      Click anywhere to place hotspot…
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stages list */}
          <div className="mt-4 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => addStage("question")} className="px-3 py-2 bg-blue-600 rounded">
                + Question
              </button>
              <button onClick={() => addStage("format")} className="px-3 py-2 bg-blue-600 rounded">
                + Format (semicolon)
              </button>
              <button onClick={() => addStage("click")} className="px-3 py-2 bg-blue-600 rounded">
                + Click (hotspot)
              </button>
              <button onClick={() => addStage("codeRange")} className="px-3 py-2 bg-blue-600 rounded">
                + Code: 0→1000
              </button>
              <button onClick={() => addStage("convert")} className="px-3 py-2 bg-blue-600 rounded">
                + CSV → JSON
              </button>
            </div>

            {sortedStages.length === 0 && <p className="text-sm opacity-70">No stages yet. Add one above.</p>}

            <div className="space-y-3">
              {sortedStages.map((s, i) => (
                <div key={s.id} className="rounded-xl p-3 bg-white/10 border border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Stage {i + 1}</div>
                    <div className="flex gap-2">
                      <button onClick={() => moveStage(s.id, -1)} className="px-2 py-1 bg-slate-600 rounded text-sm">
                        ↑
                      </button>
                      <button onClick={() => moveStage(s.id, 1)} className="px-2 py-1 bg-slate-600 rounded text-sm">
                        ↓
                      </button>
                      <button onClick={() => removeStage(s.id)} className="px-2 py-1 bg-rose-600 rounded text-sm">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <label className="flex flex-col">
                      <span className="text-xs opacity-80">Title</span>
                      <input
                        value={s.title}
                        onChange={(e) => updateStage(s.id, { title: e.target.value })}
                        className="px-3 py-2 rounded bg-black/30 outline-none"
                      />
                    </label>

                    <label className="flex flex-col">
                      <span className="text-xs opacity-80">Type</span>
                      <select
                        value={s.type}
                        onChange={(e) => updateStage(s.id, { type: e.target.value as StageType })}
                        className="px-3 py-2 rounded bg-black/30 outline-none"
                      >
                        <option value="question">Question</option>
                        <option value="format">Format (semicolon)</option>
                        <option value="click">Click (hotspot)</option>
                        <option value="codeRange">Code: 0→1000</option>
                        <option value="convert">CSV → JSON</option>
                      </select>
                    </label>
                  </div>

                  {/* Type-specific fields */}
                  {s.type === "click" ? (
                    <div className="mt-2">
                      <div className="text-xs opacity-80 mb-1">Hotspot position (click “Place” then click on image)</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPlacingFor(s.id)}
                          className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500"
                        >
                          Place
                        </button>
                        <div className="text-sm opacity-80">
                          {s.hotspotX != null && s.hotspotY != null ? (
                            <>
                              {s.hotspotX}% / {s.hotspotY}%
                            </>
                          ) : (
                            "Not set"
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="flex flex-col mt-2">
                        <span className="text-xs opacity-80">
                          {s.type === "convert"
                            ? "CSV input"
                            : s.type === "format"
                            ? "Code line (needs semicolon)"
                            : s.type === "codeRange"
                            ? "Code template (must return array 0..1000)"
                            : "Question / Prompt"}
                        </span>
                        <textarea
                          rows={s.type === "format" ? 3 : 6}
                          value={s.question || ""}
                          onChange={(e) => updateStage(s.id, { question: e.target.value })}
                          className="px-3 py-2 rounded bg-black/30 outline-none font-mono"
                        />
                      </label>

                      <label className="flex flex-col mt-2">
                        <span className="text-xs opacity-80">Correct answer (for “question”; optional otherwise)</span>
                        <input
                          value={s.correctAnswer || ""}
                          onChange={(e) => updateStage(s.id, { correctAnswer: e.target.value })}
                          className="px-3 py-2 rounded bg-black/30 outline-none"
                        />
                      </label>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Export / Preview */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={previewExport}
              disabled={!readyToExport}
              className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
            >
              Preview playable HTML
            </button>
            <button
              onClick={downloadExport}
              disabled={!readyToExport}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              Generate & download HTML
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
