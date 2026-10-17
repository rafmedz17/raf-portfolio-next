"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/theme";
import * as sound from "@/lib/sound";

const INTERACTIVE = "a[href], button, [role='button'], label, summary, input[type='checkbox']";
const SPARKS = 8;
let nextId = 0;

// What kind of thing was clicked → which sound to play.
// Elements can override with data-sfx="none" (they make their own sound).
function classify(el) {
  const override = el.closest("[data-sfx]")?.dataset.sfx;
  if (override) return override;
  if (el.tagName === "A") {
    const href = el.getAttribute("href") ?? "";
    if (el.hasAttribute("download")) return "download";
    if (href.startsWith("mailto:")) return "mail";
    if (href.startsWith("#")) return "navigate";
    if (el.target === "_blank" || (el.host && el.host !== window.location.host)) return "launch";
    return "click";
  }
  return "click";
}

// Pretty label for the "opening …" toast.
function describe(el) {
  try {
    const url = new URL(el.href);
    if (url.host === window.location.host) return url.pathname;
    return (url.host.replace(/^www\./, "") + url.pathname).replace(/\/$/, "");
  } catch {
    return el.getAttribute("href");
  }
}

// Site-wide click feedback: a ripple + sparks where you click, and a sound
// that matches what was clicked. Outgoing links also get an "opening…" toast.
export default function ClickFX() {
  const [ripples, setRipples] = useState([]);
  const [launch, setLaunch] = useState(null);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (e.button !== 0 || prefersReducedMotion()) return;
      if (e.target.closest(".intro")) return; // the intro has its own effects
      const strong = Boolean(e.target.closest(INTERACTIVE));
      const id = ++nextId;
      setRipples((list) => [...list.slice(-6), { id, x: e.clientX, y: e.clientY, strong }]);
      setTimeout(() => setRipples((list) => list.filter((r) => r.id !== id)), 700);
    };

    const onClick = (e) => {
      const el = e.target.closest(INTERACTIVE);
      if (!el || el.closest(".intro")) return;
      const kind = classify(el);
      if (kind === "none") return;
      ({ click: sound.click, navigate: sound.navigate, launch: sound.launch, mail: sound.mail, download: sound.download }[kind] ?? sound.click)();

      if (kind === "launch") {
        const id = ++nextId;
        setLaunch({ id, label: describe(el) });
        setTimeout(() => setLaunch((current) => (current?.id === id ? null : current)), 1800);
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" aria-hidden="true">
        {ripples.map((r) => (
          <span key={r.id} className="absolute" style={{ left: r.x, top: r.y }}>
            <span className={`fx-ring ${r.strong ? "" : "soft"}`} />
            {r.strong &&
              Array.from({ length: SPARKS }, (_, i) => (
                <span
                  key={i}
                  className="fx-spark"
                  style={{ "--a": `${(360 / SPARKS) * i + (r.id % 7) * 9}deg`, "--d": `${22 + ((r.id + i) % 3) * 8}px` }}
                />
              ))}
          </span>
        ))}
      </div>

      {launch && (
        <div key={launch.id} className="toast-in pointer-events-none fixed right-4 bottom-4 z-[96] w-72 overflow-hidden rounded-lg border border-line bg-bg/95 shadow-2xl backdrop-blur" role="status">
          <div className="flex items-center gap-2 px-3 py-2.5 font-mono text-xs">
            <span className="text-accent">$</span>
            <span className="text-muted">open</span>
            <span className="min-w-0 flex-1 truncate">{launch.label}</span>
            <span className="text-accent">↗</span>
          </div>
          <div className="h-0.5 bg-surface">
            <div className="launch-bar h-full bg-accent" />
          </div>
        </div>
      )}
    </>
  );
}
