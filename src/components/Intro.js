"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/theme";
import * as sound from "@/lib/sound";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01ABCDEF";

// Timeline (ms). The visuals for each phase live in globals.css (.intro).
const TITLE_AT = 1800;
const EXIT_AT = 3900;
const EXIT_DURATION = 1100;
// Must match the boot-line transition delay in globals.css.
const lineDelay = (i) => i * 210 + 250;

// Cinematic opening: boot log → name reveal → curtain split.
// Whether it plays is decided before first paint by a script in layout.js,
// which sets <html data-intro="play">. Plays once per session; skippable.
//
// It starts on its own. Browsers block audio until the visitor clicks or
// presses a key, so on a fresh visit it plays silently; replays (typing
// "reboot" in the terminal) have sound.
export default function Intro({ name, role, lines }) {
  const rootRef = useRef(null);
  const counterRef = useRef(null);
  const nameRef = useRef(null);
  const lineCount = lines.length;

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    let timers = [];
    let frames = [];
    let running = false;
    let drone = null;

    const after = (ms, fn) => timers.push(setTimeout(fn, ms));
    const stop = () => {
      timers.forEach(clearTimeout);
      frames.forEach(cancelAnimationFrame);
      timers = [];
      frames = [];
    };
    const phase = () => root.dataset.phase;
    const setPhase = (p) => (root.dataset.phase = p);

    // 000 → 100 counter + progress bar
    const countUp = (duration) => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        counterRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
        root.style.setProperty("--progress", eased);
        if (p < 1) frames.push(requestAnimationFrame(step));
      };
      frames.push(requestAnimationFrame(step));
    };

    // Decrypts the name from random glyphs.
    const scramble = (el, text, duration) => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = [...text]
          .map((ch, i) => (ch === " " || p > (i + 1) / (text.length + 1) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("");
        if (p < 1) frames.push(requestAnimationFrame(step));
      };
      frames.push(requestAnimationFrame(step));
    };

    const finish = () => {
      stop();
      running = false;
      html.removeAttribute("data-intro");
      setPhase("start");
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
    };

    const exit = () => {
      if (!running || phase() === "exit") return;
      stop();
      drone?.stop(0.25);
      sound.whoosh(1.1);
      if (nameRef.current) nameRef.current.textContent = name;
      setPhase("exit");
      html.dataset.intro = "exit"; // unlocks scroll + starts the hero entrance
      window.dispatchEvent(new Event("intro:done"));
      after(EXIT_DURATION, finish);
    };

    const boot = () => {
      setPhase("boot");
      countUp(TITLE_AT - 300);
      drone = sound.hum(TITLE_AT / 1000 + 0.4);
      for (let i = 0; i < lineCount; i++) after(lineDelay(i), sound.tick);
      after(TITLE_AT, () => {
        setPhase("title");
        drone?.stop(0.2);
        sound.impact();
        sound.chatter(1);
        scramble(nameRef.current, name, 1000);
      });
      after(EXIT_AT, exit);
    };

    const play = () => {
      stop();
      running = true;
      html.dataset.intro = "play";
      setPhase("start");
      void root.offsetWidth; // restart CSS transitions on replay
      boot();
    };

    const onKey = (e) => {
      if (!running || e.metaKey || e.ctrlKey || e.altKey) return;
      exit();
    };

    const onPointer = () => {
      if (running) exit();
    };

    const onScroll = () => {
      if (running) exit();
    };

    const replay = () => {
      if (prefersReducedMotion()) return;
      window.scrollTo({ top: 0 });
      play();
    };

    if (html.dataset.intro === "play") play();

    window.addEventListener("intro:replay", replay);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    root.addEventListener("click", onPointer);
    return () => {
      stop();
      drone?.stop(0.1);
      // If the intro is really gone (not just React re-running this effect,
      // which it does twice in development), don't leave the page locked.
      if (running) {
        setTimeout(() => {
          if (!document.querySelector(".intro")) html.removeAttribute("data-intro");
        }, 0);
      }
      window.removeEventListener("intro:replay", replay);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      root.removeEventListener("click", onPointer);
    };
  }, [name, lineCount]);

  return (
    <div ref={rootRef} className="intro" data-phase="start" role="dialog" aria-label="Intro">
      {/* Curtain halves (with film letterbox bars) */}
      <div className="intro-panel intro-panel-top" aria-hidden="true">
        <span className="intro-letterbox" />
      </div>
      <div className="intro-panel intro-panel-bottom" aria-hidden="true">
        <span className="intro-letterbox" />
      </div>

      <div className="intro-content">
        <div className="intro-vignette" aria-hidden="true" />

        {/* Top row */}
        <div className="intro-chrome absolute inset-x-0 top-[12vh] flex items-center justify-between px-6 font-mono text-[11px] tracking-wider uppercase sm:px-10" aria-hidden="true">
          <span>
            <span className="intro-accent">●</span> ~/{name.toLowerCase()} — boot
          </span>
          <span>
            <span ref={counterRef}>000</span>%
          </span>
        </div>

        {/* Boot log */}
        <ul className="intro-boot absolute bottom-[16vh] left-6 space-y-1 font-mono text-[11px] sm:left-10 sm:text-xs" aria-hidden="true">
          {lines.map((line, i) => (
            <li key={i} className="intro-line" style={{ "--i": i }}>
              <span className="intro-muted">[</span>
              <span className="intro-accent">  ok  </span>
              <span className="intro-muted">]</span> {line}
            </li>
          ))}
        </ul>

        {/* Progress line */}
        <div className="intro-progress absolute inset-x-6 bottom-[12vh] h-px sm:inset-x-10" aria-hidden="true">
          <span />
        </div>

        {/* Title card */}
        <div className="intro-title absolute inset-0 grid place-items-center px-6 text-center" aria-hidden="true">
          <div>
            <p className="intro-eyebrow font-mono text-[11px] tracking-[0.3em] uppercase">{"// now presenting"}</p>
            <p ref={nameRef} className="intro-name mt-4 text-[clamp(3.5rem,14vw,11rem)] leading-none font-semibold">
              {name}
            </p>
            <span className="intro-rule mx-auto mt-6 block h-px w-40" />
            <p className="intro-role mt-5 font-mono text-xs tracking-[0.25em] uppercase sm:text-sm">{role}</p>
          </div>
        </div>

        <p className="intro-skip absolute right-6 bottom-[4vh] font-mono text-[10px] tracking-widest uppercase sm:right-10" aria-hidden="true">
          press any key to skip ↵
        </p>
      </div>
    </div>
  );
}
