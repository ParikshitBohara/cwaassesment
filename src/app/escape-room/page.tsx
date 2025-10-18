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
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --bg-elevated: #ffffff;
  --bg-overlay: rgba(255, 255, 255, 0.8);
  
  --text-primary: #000000;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --text-inverse: #ffffff;
  
  --border-primary: #dee2e6;
  --border-secondary: #ced4da;
  --border-accent: #3b82f6;
  
  --accent-primary: #3b82f6;
  --accent-secondary: #1d4ed8;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-error: #ef4444;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  --pin: #60a5fa;
  --ok: #10b981;
  --warn: #f59e0b;
  --err: #ef4444;
}

[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2d2d2d;
  --bg-elevated: #000000;
  --bg-overlay: rgba(0, 0, 0, 0.8);
  
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;
  --text-inverse: #000000;
  
  --border-primary: #404040;
  --border-secondary: #525252;
  --border-accent: #60a5fa;
  
  --accent-primary: #60a5fa;
  --accent-secondary: #3b82f6;
  --accent-success: #34d399;
  --accent-warning: #fbbf24;
  --accent-error: #f87171;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}

html,body{height:100%}
body{
  margin:0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
  display: grid;
  place-items: start center;
}

.wrap{
  width: min(1150px, 96vw);
  padding: 1.5rem;
  max-width: 100%;
}

header{
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--shadow-sm);
}

.title{
  font-weight: 700;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--text-primary);
  margin: 0;
}

.timer{
  font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.scene{
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.scene:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.scene img{
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

.scene:hover img {
  transform: scale(1.02);
}

.pin{
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--pin);
  color: var(--text-inverse);
  width: 32px;
  height: 32px;
  border: 2px solid var(--bg-elevated);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  font-size: 14px;
}

.pin:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: var(--shadow-xl);
}

.grid{
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.card{
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card h2{
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.muted{
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

textarea, input[type="text"]{
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: var(--bg-elevated);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  resize: vertical;
}

textarea:focus, input[type="text"]:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button{
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

button:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

button:active {
  transform: translateY(0);
}

button.ok{background: var(--accent-success)}
button.ok:hover{background: #059669;}

button.warn{background: var(--accent-warning)}
button.warn:hover{background: #d97706;}

button.ghost{
  background: var(--text-tertiary);
  color: var(--text-inverse);
}
button.ghost:hover{
  background: var(--text-secondary);
}

.badge{
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.okbg{
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--accent-success);
  color: var(--accent-success);
}

.errbg{
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--accent-error);
  color: var(--accent-error);
}

footer{
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.disabled{
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.3);
}

pre{
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow-x: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wrap {
    padding: 1rem;
  }
  
  header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  footer {
    flex-direction: column;
    text-align: center;
  }
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
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
    <main className="min-h-screen p-6 bg-theme-primary text-theme-primary">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Left: Rooms list / actions */}
        <aside className="card bg-theme-elevated border-theme-primary">
          <h2 className="font-bold mb-3 text-theme-primary">Saved Rooms</h2>
          <button
            onClick={loadRooms}
            className="w-full mb-3 px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary hover:bg-theme-secondary disabled:opacity-50 transition-all duration-200 hover:scale-105"
            disabled={loadingRooms}
          >
            {loadingRooms ? "Loading…" : "Refresh"}
          </button>

          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {rooms.length === 0 && <p className="text-sm text-theme-secondary">No rooms yet.</p>}
            {rooms.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-theme-secondary border border-theme-primary hover:bg-theme-tertiary transition-all duration-200">
                <div className="font-semibold text-sm truncate text-theme-primary">{r.title}</div>
                <div className="text-xs text-theme-secondary">{new Date(r.createdAt ?? "").toLocaleString()}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => loadRoom(r.id!)} className="px-2 py-1 bg-accent-primary text-white rounded text-sm hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                    Edit
                  </button>
                  <button onClick={() => deleteExisting(r.id!)} className="px-2 py-1 bg-accent-error text-white rounded text-sm hover:bg-red-600 transition-all duration-200 hover:scale-105">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-4 border-theme-primary" />

          <div className="space-y-2">
            <button onClick={saveNew} className="w-full px-3 py-2 rounded-lg bg-accent-success text-white hover:bg-green-600 transition-all duration-200 hover:scale-105">
              💾 Save New
            </button>
            <button
              onClick={updateExisting}
              disabled={!roomId}
              className="w-full px-3 py-2 rounded-lg bg-accent-warning text-white hover:bg-yellow-600 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              ⟳ Update
            </button>
            <button
              onClick={() => deleteExisting()}
              disabled={!roomId}
              className="w-full px-3 py-2 rounded-lg bg-accent-error text-white hover:bg-red-600 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              🗑 Delete
            </button>
          </div>
        </aside>

        {/* Right: Editor */}
        <section>
          <header className="card bg-theme-elevated border-theme-primary">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-theme-secondary mb-1">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                  placeholder="My Escape Room"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-theme-secondary mb-1">Timer (seconds)</span>
                <input
                  type="number"
                  min={10}
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-theme-secondary mb-1">Background image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onBgChange}
                  className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                />
              </label>
            </div>
          </header>

          {/* Scene preview & hotspot placement */}
          <div
            ref={sceneRef}
            onClick={onSceneClick}
            className="relative rounded-2xl overflow-hidden bg-theme-secondary border border-theme-primary mt-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
            style={{ minHeight: 320 }}
          >
            {!bgImage ? (
              <div className="grid place-items-center h-64 text-theme-secondary">Upload a background image to preview</div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImage} alt="scene" className="w-full h-auto block select-none transition-transform duration-300" />
                {/* show all click hotspots */}
                {sortedStages
                  .filter((s) => s.type === "click" && s.hotspotX != null && s.hotspotY != null)
                  .map((s) => (
                    <div
                      title={s.title}
                      key={s.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 bg-accent-primary text-white border-2 border-white rounded-full w-8 h-8 grid place-items-center font-bold shadow-lg hover:scale-110 transition-all duration-200"
                      style={{ left: `${s.hotspotX}%`, top: `${s.hotspotY}%` }}
                    >
                      🐞
                    </div>
                  ))}
                {placingFor && (
                  <div className="absolute inset-3 grid place-items-start">
                    <div className="px-3 py-1 rounded-lg bg-accent-warning text-white font-semibold shadow-lg backdrop-filter blur(10px)">
                      Click anywhere to place hotspot…
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stages list */}
          <div className="mt-4 card bg-theme-elevated border-theme-primary">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => addStage("question")} className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                + Question
              </button>
              <button onClick={() => addStage("format")} className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                + Format (semicolon)
              </button>
              <button onClick={() => addStage("click")} className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                + Click (hotspot)
              </button>
              <button onClick={() => addStage("codeRange")} className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                + Code: 0→1000
              </button>
              <button onClick={() => addStage("convert")} className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-200 hover:scale-105">
                + CSV → JSON
              </button>
            </div>

            {sortedStages.length === 0 && <p className="text-sm text-theme-secondary">No stages yet. Add one above.</p>}

            <div className="space-y-3">
              {sortedStages.map((s, i) => (
                <div key={s.id} className="rounded-xl p-4 bg-theme-secondary border border-theme-primary hover:bg-theme-tertiary transition-all duration-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-theme-primary">Stage {i + 1}</div>
                    <div className="flex gap-2">
                      <button onClick={() => moveStage(s.id, -1)} className="px-2 py-1 bg-theme-tertiary text-theme-primary rounded text-sm hover:bg-accent-primary hover:text-white transition-all duration-200 hover:scale-105">
                        ↑
                      </button>
                      <button onClick={() => moveStage(s.id, 1)} className="px-2 py-1 bg-theme-tertiary text-theme-primary rounded text-sm hover:bg-accent-primary hover:text-white transition-all duration-200 hover:scale-105">
                        ↓
                      </button>
                      <button onClick={() => removeStage(s.id)} className="px-2 py-1 bg-accent-error text-white rounded text-sm hover:bg-red-600 transition-all duration-200 hover:scale-105">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <label className="flex flex-col">
                      <span className="text-xs text-theme-secondary mb-1">Title</span>
                      <input
                        value={s.title}
                        onChange={(e) => updateStage(s.id, { title: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                      />
                    </label>

                    <label className="flex flex-col">
                      <span className="text-xs text-theme-secondary mb-1">Type</span>
                      <select
                        value={s.type}
                        onChange={(e) => updateStage(s.id, { type: e.target.value as StageType })}
                        className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
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
                      <div className="text-xs text-theme-secondary mb-1">Hotspot position (click "Place" then click on image)</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPlacingFor(s.id)}
                          className="px-3 py-2 rounded-lg bg-accent-warning text-white hover:bg-yellow-600 transition-all duration-200 hover:scale-105"
                        >
                          Place
                        </button>
                        <div className="text-sm text-theme-secondary">
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
                        <span className="text-xs text-theme-secondary mb-1">
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
                          className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none font-mono focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                        />
                      </label>

                      <label className="flex flex-col mt-2">
                        <span className="text-xs text-theme-secondary mb-1">Correct answer (for "question"; optional otherwise)</span>
                        <input
                          value={s.correctAnswer || ""}
                          onChange={(e) => updateStage(s.id, { correctAnswer: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-theme-primary bg-theme-elevated text-theme-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
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
              className="px-4 py-2 rounded-lg bg-accent-warning text-white hover:bg-yellow-600 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              Preview playable HTML
            </button>
            <button
              onClick={downloadExport}
              disabled={!readyToExport}
              className="px-4 py-2 rounded-lg bg-accent-success text-white hover:bg-green-600 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              Generate & download HTML
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
