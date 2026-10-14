"use client";

import { useCallback, useEffect, useState } from "react";
import { ACHIEVEMENTS, getUnlocked, unlock } from "@/lib/achievements";
import { prefersReducedMotion } from "@/lib/theme";
import MatrixRain from "./MatrixRain";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function greetConsole(profile) {
  console.log(
    `%c~/${profile.name.toLowerCase()}%c\n\nOh hey, you opened the console. 👀\nYou're clearly my kind of person — let's talk: ${profile.email}\n\nP.S. try the Konami code on the page.`,
    "font: 600 20px monospace; color: #4ade80;",
    "font: 13px monospace;"
  );
}

// Site-wide fun: achievement toasts + panel, Konami code, console hello.
export default function Extras({ profile }) {
  const [toasts, setToasts] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const [unlocked, setUnlocked] = useState([]);

  const stopMatrix = useCallback(() => setMatrix(false), []);

  useEffect(() => {
    greetConsole(profile);
    // Listeners are registered once; the greeting only needs the first profile.

    const onAchievement = (e) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === e.detail);
      if (!achievement) return;
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, achievement, count: getUnlocked().length }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    };

    let progress = 0;
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        unlock("konami");
        if (!prefersReducedMotion()) setMatrix(true);
      }
    };

    const onOpenPanel = () => {
      setUnlocked(getUnlocked());
      setPanelOpen(true);
    };

    const footer = document.getElementById("site-footer");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) unlock("explorer");
    });
    if (footer) observer.observe(footer);

    window.addEventListener("achievement", onAchievement);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-achievements", onOpenPanel);
    return () => {
      observer.disconnect();
      window.removeEventListener("achievement", onAchievement);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-achievements", onOpenPanel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {matrix && <MatrixRain onDone={stopMatrix} />}

      <div className="pointer-events-none fixed bottom-4 left-4 z-[80] flex flex-col gap-2" aria-live="polite">
        {toasts.map(({ id, achievement, count }) => (
          <div
            key={id}
            className="toast-in pointer-events-auto flex items-center gap-3 rounded-lg border border-line bg-bg/95 py-2.5 pr-4 pl-3 shadow-xl backdrop-blur"
          >
            <span className="grid size-8 place-items-center rounded-md bg-accent-soft text-base">🏆</span>
            <div>
              <p className="font-mono text-[10px] tracking-wide text-accent uppercase">
                Achievement unlocked · {count}/{ACHIEVEMENTS.length}
              </p>
              <p className="text-sm font-medium">{achievement.title}</p>
            </div>
          </div>
        ))}
      </div>

      {panelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setPanelOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setPanelOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Achievements"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-bg shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="font-semibold">Achievements</p>
                <p className="font-mono text-xs text-muted">
                  {unlocked.length}/{ACHIEVEMENTS.length} unlocked
                  {unlocked.length === ACHIEVEMENTS.length && " — 100%. You should probably hire me."}
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setPanelOpen(false)}
                className="rounded border border-line px-1.5 font-mono text-[10px] text-muted hover:text-fg"
              >
                ESC
              </button>
            </div>
            <div className="h-1 bg-surface">
              <div className="h-full bg-accent transition-all" style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }} />
            </div>
            <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">
              {ACHIEVEMENTS.map((a) => {
                const got = unlocked.includes(a.id);
                return (
                  <li key={a.id} className={`flex items-center gap-3 px-5 py-3 ${got ? "" : "opacity-60"}`}>
                    <span className={`grid size-7 place-items-center rounded-md text-sm ${got ? "bg-accent-soft" : "bg-surface grayscale"}`}>
                      {got ? "🏆" : "🔒"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{got ? a.title : "???"}</p>
                      <p className="font-mono text-xs text-muted">{a.hint}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
