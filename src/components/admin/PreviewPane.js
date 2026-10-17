"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: "monitor", width: 1280 },
  { id: "tablet", label: "Tablet", icon: "tablet", width: 834 },
  { id: "mobile", label: "Mobile", icon: "phone", width: 390 },
];

// Shows the live site in an iframe, scaled down to fit the pane.
export default function PreviewPane({ content, anchor }) {
  const iframeRef = useRef(null);
  const stageRef = useRef(null);
  const [device, setDevice] = useState(DEVICES[0]);
  const [theme, setTheme] = useState("dark");
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const send = (msg) => iframeRef.current?.contentWindow?.postMessage(msg, window.location.origin);

  // Measure available space so the iframe can be scaled to fit.
  useEffect(() => {
    const el = stageRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setStage({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.type === "preview-ready" && e.source === iframeRef.current?.contentWindow) {
        setReady(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Push the draft (debounced so typing stays smooth).
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => send({ type: "draft", content }), 120);
    return () => clearTimeout(id);
  }, [content, ready]);

  useEffect(() => {
    if (ready) send({ type: "theme", theme });
  }, [theme, ready]);

  useEffect(() => {
    if (ready && anchor) send({ type: "scroll", id: anchor });
  }, [anchor, ready]);

  const padding = device.id === "desktop" ? 0 : 24;
  const scale = stage.width ? Math.min(1, (stage.width - padding * 2) / device.width) : 1;
  const frameHeight = stage.height ? (stage.height - padding * 2) / scale : 800;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-surface p-0.5" role="radiogroup" aria-label="Preview size">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={device.id === d.id}
              onClick={() => setDevice(d)}
              title={`${d.label} · ${d.width}px`}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${device.id === d.id ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg"}`}
            >
              <Icon name={d.icon} className="size-3.5" />
              <span className="hidden xl:inline">{d.label}</span>
            </button>
          ))}
        </div>

        <span className="hidden font-mono text-[11px] text-muted sm:block">
          {device.width}px · {Math.round(scale * 100)}%
        </span>

        <div className="flex items-center gap-1">
          {content.settings?.intro !== false && (
            <button
              type="button"
              onClick={() => send({ type: "intro" })}
              title="Play the cinematic intro"
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted hover:bg-surface hover:text-fg"
            >
              <Icon name="sparkle" className="size-3.5" />
              <span className="hidden xl:inline">Play intro</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title="Switch preview theme"
            className="grid size-7 place-items-center rounded-md text-muted hover:bg-surface hover:text-fg"
          >
            <Icon name={theme === "dark" ? "moon" : "sun"} className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setReady(false);
              setReloadKey((k) => k + 1);
            }}
            title="Reload preview"
            className="grid size-7 place-items-center rounded-md text-muted hover:bg-surface hover:text-fg"
          >
            <Icon name="refresh" className="size-3.5" />
          </button>
        </div>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden bg-surface/60" style={{ padding }}>
        <div
          className={`mx-auto overflow-hidden bg-bg transition-[width] duration-300 ${device.id === "desktop" ? "" : "rounded-[1.25rem] border border-line shadow-xl"}`}
          style={{ width: device.width * scale, height: frameHeight * scale }}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src="/admin/preview"
            title="Live preview of your site"
            className="origin-top-left border-0"
            style={{ width: device.width, height: frameHeight, transform: `scale(${scale})` }}
          />
        </div>
        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-surface/60 text-sm text-muted backdrop-blur-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 animate-ping rounded-full bg-accent" /> Loading preview…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
