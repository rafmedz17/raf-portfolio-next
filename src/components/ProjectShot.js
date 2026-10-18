"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as sound from "@/lib/sound";
import Photo from "./Photo";

// "https://www.example.com/app" → "example.com"
function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function Dots() {
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      <span className="size-2.5 rounded-full bg-muted/30" />
      <span className="size-2.5 rounded-full bg-muted/30" />
      <span className="size-2.5 rounded-full bg-muted/30" />
    </span>
  );
}

// A project screenshot in a browser frame. Click to view it full size.
export default function ProjectShot({ src, title, live }) {
  const [state, setState] = useState("closed"); // closed | open | closing
  const timer = useRef(null);
  const host = hostOf(live);
  const alt = `Screenshot of ${title || "the project"}`;

  const open = () => {
    clearTimeout(timer.current);
    sound.open();
    setState("open");
  };

  const close = useCallback(() => {
    sound.close();
    setState("closing");
    timer.current = setTimeout(() => setState("closed"), 250);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (state !== "open") return;
    const onKey = (e) => e.key === "Escape" && close();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [state, close]);

  const closing = state === "closing";

  return (
    <>
      <button
        type="button"
        onClick={open}
        data-sfx="none"
        aria-label={`View ${alt.toLowerCase()} full size`}
        className="group/shot block w-full overflow-hidden rounded-lg border border-line bg-surface text-left shadow-sm transition-colors hover:border-accent/60 md:w-64"
      >
        <span className="flex items-center gap-2 border-b border-line px-2.5 py-1.5">
          <Dots />
          {host && <span className="min-w-0 truncate font-mono text-[10px] text-muted">{host}</span>}
          <svg viewBox="0 0 24 24" className="ml-auto size-3.5 shrink-0 text-muted transition-colors group-hover/shot:text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </span>
        <span className="relative block aspect-[16/10] overflow-hidden">
          <Photo
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 256px, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover/shot:scale-[1.04]"
          />
          <span className="absolute inset-0 grid place-items-center bg-black/50 font-mono text-[11px] text-white opacity-0 transition-opacity duration-300 group-hover/shot:opacity-100" aria-hidden="true">
            click to expand
          </span>
        </span>
      </button>

      {state !== "closed" &&
        // Portaled so the filter's dimming (opacity) on the project row can't reach it.
        createPortal(
        <div
          className={`fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6 ${closing ? "backdrop-out" : "backdrop-in"}`}
          onMouseDown={(e) => !closing && e.target === e.currentTarget && close()}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className={`flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-line bg-bg shadow-2xl ${closing ? "sheet-out" : "sheet-in"}`}>
            <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
              <Dots />
              <p className="min-w-0 flex-1 truncate font-mono text-sm">{host || title}</p>
              {live && (
                <a
                  href={live}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden h-8 items-center rounded-md border border-line px-3 font-mono text-xs text-muted transition hover:bg-surface hover:text-fg sm:flex"
                >
                  visit site ↗
                </a>
              )}
              <button
                type="button"
                onClick={() => !closing && close()}
                data-sfx="none"
                autoFocus
                aria-label="Close screenshot"
                className="grid size-8 place-items-center rounded-md text-muted transition hover:bg-surface hover:text-fg"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {/* Tall full-page screenshots scroll inside the viewer. */}
            <div className="min-h-0 overflow-y-auto overscroll-contain bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="block h-auto w-full" />
            </div>
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
