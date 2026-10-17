"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isGod, subscribeGod } from "@/lib/god";
import { prefersReducedMotion } from "@/lib/theme";
import * as sound from "@/lib/sound";

// Applies god mode to the page: <html data-god> switches every style to the
// retro CRT look (see globals.css), plus a scanline/vignette overlay and a
// CRT power-on / power-off animation when it changes.
export default function GodMode() {
  const god = useSyncExternalStore(subscribeGod, isGod, () => false);
  const [transition, setTransition] = useState(null); // "on" | "off" | null

  // Keep <html data-god> in sync (the admin preview iframe is left alone).
  // Only remove it after god mode was actually on, so a reload in god mode
  // (attribute already set by the script in layout.js) doesn't flicker.
  const wasGod = useRef(false);
  useEffect(() => {
    if (window.self !== window.top) return;
    const html = document.documentElement;
    if (god) html.setAttribute("data-god", "");
    else if (wasGod.current) html.removeAttribute("data-god");
    wasGod.current = god;
  }, [god]);

  // Power on/off effect whenever it's toggled.
  useEffect(() => {
    let timer;
    const onChange = (e) => {
      const on = e.detail;
      if (on) setTimeout(sound.powerOn, 30); // after data-god is set → 8-bit
      else sound.powerOff();
      if (prefersReducedMotion()) return;
      clearTimeout(timer);
      setTransition(on ? "on" : "off");
      timer = setTimeout(() => setTransition(null), on ? 700 : 600);
    };
    window.addEventListener("godchange", onChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("godchange", onChange);
    };
  }, []);

  return (
    <>
      {god && <div className="crt-overlay" aria-hidden="true" />}
      {transition && <div key={transition} className={`crt-flash crt-flash-${transition}`} aria-hidden="true" />}
    </>
  );
}
