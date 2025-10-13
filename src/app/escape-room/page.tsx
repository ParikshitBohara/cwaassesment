"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ProgressState = {
  studentNumber: string;
  stage1: boolean;
  stage2: boolean;
  stage3: boolean;
  stage4: boolean;
  elapsedSeconds: number;
};

type Challenge = "range" | "evens" | "odds" | "fib";
type PortMode   = "csv-to-json" | "json-to-csv";

export default function EscapeRoomPage() {
  const [studentNumber, setStudentNumber] = useState("sXXXXXXX");

  // timer
  const [manualSeconds, setManualSeconds] = useState<number>(180);
  const [seconds, setSeconds] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // stages
  const [stage1, setStage1] = useState(false);
  const [stage2, setStage2] = useState(false);
  const [stage3, setStage3] = useState(false);
  const [stage4, setStage4] = useState(false);

  // dev helper: let you show all at once for quick testing
  const [showAll, setShowAll] = useState(false);

  // stage 2
  const [codeInput, setCodeInput] = useState("console.log('Hello World');");

  // stage 3
  const [challenge, setChallenge] = useState<Challenge>("range");
  const [userCode, setUserCode] = useState<string>(
    `// Return an array for the selected task.\n// Example for 0..1000\nconst arr = [];\nfor (let i = 0; i <= 1000; i++) arr.push(i);\nreturn arr;`
  );
  const [runOutput, setRunOutput] = useState<string>("(no output yet)");

  // stage 4
  const [portMode, setPortMode] = useState<PortMode>("csv-to-json");
  const [portInput, setPortInput] = useState<string>("name,age\nAlice,30\nBob,25");
  const [portOutput, setPortOutput] = useState<string>("(no output yet)");

  const allCleared = useMemo(() => stage1 && stage2 && stage3 && stage4, [stage1, stage2, stage3, stage4]);

  // which stage should be shown/active right now
  const currentStage = useMemo(() => {
    if (!stage1) return 1;
    if (!stage2) return 2;
    if (!stage3) return 3;
    if (!stage4) return 4;
    return 5; // finished
  }, [stage1, stage2, stage3, stage4]);

  const isEnabled = (n: number) => showAll || currentStage === n;

  // ===== TIMER ENGINE =====
  useEffect(() => {
    if (running) {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running && !allCleared) {
      setRunning(false);
      alert("⏰ Time’s up! Try again.");
    }
  }, [seconds, running, allCleared]);

  const startTimer = useCallback(() => {
    setSeconds(Math.max(0, manualSeconds | 0));
    setRunning(true);
  }, [manualSeconds]);

  const stopTimer = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
    setStage1(false);
    setStage2(false);
    setStage3(false);
    setStage4(false);
  }, []);

  // ===== Stage 1: find key =====
  const onHotspotClick = () => {
    if (!isEnabled(1)) return;
    if (!stage1) {
      setStage1(true);
      alert("🔑 You found the key! Stage 2 unlocked.");
    }
  };

  // ===== Stage 2: semicolon check =====
  const validateStage2 = () => {
    if (!isEnabled(2)) return;
    const ok = codeInput.trim().endsWith(";");
    setStage2(ok);
    alert(ok ? "✅ Correct! Stage 3 unlocked." : "❌ Not quite. Add a semicolon ;");
  };

  // ===== Stage 3: run user code =====
  const runUserCode = () => {
    if (!isEnabled(3)) return;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(userCode);
      const result = fn();

      if (!Array.isArray(result)) {
        setRunOutput("❌ Your code must return an Array.");
        setStage3(false);
        return;
      }

      let ok = false;
      if (challenge === "range") {
        ok = result.length === 1001 && result[0] === 0 && result[1000] === 1000;
      } else if (challenge === "evens") {
        ok = result.length === 501 && result[0] === 0 && result[500] === 1000 && result.every((x: number) => x % 2 === 0);
      } else if (challenge === "odds") {
        ok = result.length === 500 && result[0] === 1 && result[499] === 999 && result.every((x: number) => x % 2 === 1);
      } else if (challenge === "fib") {
        const isFib = (arr: number[]) => {
          if (arr.length < 2 || arr[0] !== 0 || arr[1] !== 1) return false;
          for (let i = 2; i < arr.length; i++) if (arr[i] !== arr[i - 1] + arr[i - 2]) return false;
          return true;
        };
        ok = isFib(result);
      }

      const preview =
        result.length <= 20
          ? `[${result.join(", ")}]`
          : `[${result.slice(0, 10).join(", ")} ... ${result.slice(-10).join(", ")}] (len=${result.length})`;

      setRunOutput(`${ok ? "✅ Valid" : "❌ Invalid"} → ${preview}`);
      setStage3(ok);
      if (ok) alert("Great! Stage 4 unlocked.");
    } catch (e: any) {
      setRunOutput("❌ Runtime error: " + (e?.message ?? String(e)));
      setStage3(false);
    }
  };

  // ===== Stage 4: CSV ⇄ JSON =====
  const csvToJson = (csv: string) => {
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
      return obj;
    });
  };

  const jsonToCsv = (jsonText: string) => {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr) || arr.length === 0 || typeof arr[0] !== "object") {
      throw new Error('JSON must be an array of objects, e.g., [{"name":"Alice","age":30}]');
    }
    const headers = Object.keys(arr[0]);
    const rows = arr.map((obj: any) => headers.map((h) => String(obj[h] ?? "")).join(","));
    return [headers.join(","), ...rows].join("\n");
  };

  const runPort = () => {
    if (!isEnabled(4)) return;
    try {
      if (portMode === "csv-to-json") {
        const json = csvToJson(portInput);
        setPortOutput(JSON.stringify(json, null, 2));
        const ok = Array.isArray(json) && json.length >= 1;
        setStage4(ok);
        if (ok) alert("🎉 All stages complete!");
      } else {
        const csv = jsonToCsv(portInput);
        setPortOutput(csv);
        const ok = !!csv && csv.includes("\n");
        setStage4(ok);
        if (ok) alert("🎉 All stages complete!");
      }
    } catch (e: any) {
      setPortOutput("❌ Error: " + (e?.message ?? String(e)));
      setStage4(false);
    }
  };

  // Save / Load
  const saveProgress = async () => {
    if (!studentNumber || studentNumber === "sXXXXXXX") return alert("Enter your Student Number first.");
    const payload: ProgressState = {
      studentNumber,
      stage1, stage2, stage3, stage4,
      elapsedSeconds: (manualSeconds | 0) - seconds,
    };
    const res = await fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return alert("Save failed: " + (err?.error ?? res.statusText));
    }
    alert("💾 Progress saved!");
  };

  const loadLast = async () => {
    if (!studentNumber || studentNumber === "sXXXXXXX") return alert("Enter your Student Number first.");
    const res = await fetch(`/api/progress?studentNumber=${encodeURIComponent(studentNumber)}`);
    if (!res.ok) return alert("Load failed");
    const data = await res.json();
    if (!data) return alert("No saved progress yet.");
    setStage1(!!data.stage1); setStage2(!!data.stage2); setStage3(!!data.stage3); setStage4(!!data.stage4);
    setManualSeconds(Math.max(0, Number(data.elapsedSeconds ?? 0)) + 60);
    alert("Loaded your last progress (+60s buffer).");
  };

  const IconPlay = () => (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="inline-block mr-1"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>);
  const IconPause = () => (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="inline-block mr-1"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>);
  const IconReset = () => (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="inline-block mr-1"><path fill="currentColor" d="M13 3a9 9 0 1 0 8.49 6.26l-1.9.62A7 7 0 1 1 13 5v3l5-4-5-4v4z"/></svg>);

  return (
    <main
      className="min-h-screen p-6 flex flex-col gap-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1560185008-b033106af2fb?q=80&w=1920&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-6xl mx-auto bg-black/50 rounded-2xl p-6 shadow-xl text-white">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-3xl font-bold">Escape Room</h1>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="opacity-90">Student #</span>
              <input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="px-3 py-2 rounded bg-white/10 outline-none" placeholder="sXXXXXXX" />
            </label>
            <label className="flex items-center gap-2">
              <span className="opacity-90">Timer (s)</span>
              <input type="number" min={10} value={manualSeconds} onChange={(e) => setManualSeconds(Number(e.target.value))} className="w-24 px-3 py-2 rounded bg-white/10 outline-none" />
            </label>
            <div className="flex items-center gap-2">
              <button onClick={startTimer} className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500"><IconPlay /> Start</button>
              <button onClick={stopTimer} className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-500"><IconPause /> Pause</button>
              <button onClick={reset} className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500"><IconReset /> Reset</button>
            </div>

            {/* Dev-only toggle */}
            <label className="ml-2 text-sm flex items-center gap-2">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Show all (dev)
            </label>

            <div className="ml-auto text-lg font-mono">
              ⏳ {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
            </div>
          </div>
        </header>

        <p className="opacity-90">{allCleared ? "🎉 You escaped!" : `Current stage: ${currentStage} / 4`}</p>

        {/* Only render the active stage (unless Show all) */}
        <section className="mt-4 grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Stage 1 */}
          {(showAll || currentStage === 1) && (
            <article className={`bg-white/5 rounded-xl p-4 ${!isEnabled(1) ? "opacity-50 pointer-events-none" : ""}`}>
              <h2 className="text-xl font-semibold mb-2">Stage 1: Find the key {stage1 ? "✅" : ""}</h2>
              <p className="opacity-90 mb-3">Click the hidden hotspot in the room to find the key.</p>
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  height: 220,
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label="Escape room search area"
                role="img"
              >
                <button
                  aria-label="Hidden key hotspot"
                  title="Hidden key hotspot"
                  onClick={onHotspotClick}
                  className="absolute"
                  style={{ left: "62%", top: "58%", width: 40, height: 40, borderRadius: 9999, background: "rgba(255,255,255,0.02)" }}
                />
              </div>
              <div className="mt-3"><StatusBadge ok={stage1} /></div>
            </article>
          )}

          {/* Stage 2 */}
          {(showAll || currentStage === 2) && (
            <article className={`bg-white/5 rounded-xl p-4 ${!isEnabled(2) ? "opacity-50 pointer-events-none" : ""}`}>
              <h2 className="text-xl font-semibold mb-2">Stage 2: Format/Fix the code {stage2 ? "✅" : ""}</h2>
              <p className="opacity-90 mb-3">Ensure the line ends with a semicolon.</p>
              <label className="block text-sm opacity-80 mb-1">JS line</label>
              <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className="w-full px-3 py-2 rounded bg-black/30 outline-none font-mono" />
              <div className="mt-3 flex items-center gap-2">
                <button onClick={validateStage2} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500">Check</button>
                <StatusBadge ok={stage2} />
              </div>
            </article>
          )}

          {/* Stage 3 */}
          {(showAll || currentStage === 3) && (
            <article className={`bg-white/5 rounded-xl p-4 ${!isEnabled(3) ? "opacity-50 pointer-events-none" : ""}`}>
              <h2 className="text-xl font-semibold mb-2">Stage 3: Write & run your code {stage3 ? "✅" : ""}</h2>
              <label className="block text-sm opacity-80 mb-1">Choose a challenge</label>
              <select value={challenge} onChange={(e) => setChallenge(e.target.value as Challenge)} className="px-3 py-2 rounded bg-black/30 outline-none mb-3">
                <option value="range">Generate 0..1000</option>
                <option value="evens">Generate even numbers 0..1000</option>
                <option value="odds">Generate odd numbers 1..999</option>
                <option value="fib">Generate Fibonacci sequence (starting 0,1)</option>
              </select>
              <label className="block text-sm opacity-80 mb-1">Your JS code (must return an Array)</label>
              <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)} rows={8} className="w-full px-3 py-2 rounded bg-black/30 outline-none font-mono" />
              <div className="mt-3 flex items-center gap-2">
                <button onClick={runUserCode} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-500">Run & Validate</button>
                <StatusBadge ok={stage3} />
              </div>
              <div className="mt-3 text-sm bg-black/30 rounded p-2 font-mono whitespace-pre-wrap">
                <strong>Output:</strong> {runOutput}
              </div>
            </article>
          )}

          {/* Stage 4 */}
          {(showAll || currentStage === 4) && (
            <article className={`bg-white/5 rounded-xl p-4 ${!isEnabled(4) ? "opacity-50 pointer-events-none" : ""}`}>
              <h2 className="text-xl font-semibold mb-2">Stage 4: Port data CSV ⇄ JSON {stage4 ? "✅" : ""}</h2>
              <p className="opacity-90 mb-3">Convert between CSV and JSON formats.</p>
              <label className="block text-sm opacity-80 mb-1">Mode</label>
              <select value={portMode} onChange={(e) => setPortMode(e.target.value as PortMode)} className="px-3 py-2 rounded bg-black/30 outline-none mb-3">
                <option value="csv-to-json">CSV → JSON</option>
                <option value="json-to-csv">JSON → CSV</option>
              </select>
              <label className="block text-sm opacity-80 mb-1">Input</label>
              <textarea value={portInput} onChange={(e) => setPortInput(e.target.value)} rows={6} className="w-full px-3 py-2 rounded bg-black/30 outline-none font-mono" />
              <div className="mt-3 flex items-center gap-2">
                <button onClick={runPort} className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500">Convert</button>
                <StatusBadge ok={stage4} />
              </div>
              <label className="block text-sm opacity-80 mt-3 mb-1">Output</label>
              <textarea readOnly value={portOutput} rows={6} className="w-full px-3 py-2 rounded bg-black/30 outline-none font-mono" />
            </article>
          )}
        </section>

        <footer className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={saveProgress} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500">Save Progress</button>
          <button onClick={loadLast} className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500">Load Last Save</button>
          <div className="ml-auto text-lg font-semibold">{allCleared ? "🎉 You escaped!" : "Clear the current stage to unlock the next."}</div>
        </footer>
      </div>
    </main>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block text-sm px-2 py-1 rounded ${ok ? "bg-emerald-600" : "bg-gray-600"}`} aria-live="polite">
      {ok ? "Complete" : "Incomplete"}
    </span>
  );
}
