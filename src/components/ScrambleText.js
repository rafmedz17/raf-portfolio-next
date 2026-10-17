"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/theme";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01abcdef";

// Renders `text`, decrypting it from random glyphs whenever it changes
// (and on hover if `hover` is set, or when the `replayOn` window event fires).
export default function ScrambleText({ text, hover = false, replayOn, className = "" }) {
  const [display, setDisplay] = useState(text);
  const raf = useRef(0);

  const scramble = useCallback((target) => {
    cancelAnimationFrame(raf.current);
    if (prefersReducedMotion()) {
      raf.current = requestAnimationFrame(() => setDisplay(target));
      return;
    }
    let frame = 0;
    const tick = () => {
      frame++;
      let done = true;
      let out = "";
      for (let i = 0; i < target.length; i++) {
        if (target[i] === " " || frame > i * 2.5 + 10) {
          out += target[i];
        } else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);
      if (!done) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    scramble(text);
    return () => cancelAnimationFrame(raf.current);
  }, [text, scramble]);

  useEffect(() => {
    if (!replayOn) return;
    const replay = () => scramble(text);
    window.addEventListener(replayOn, replay);
    return () => window.removeEventListener(replayOn, replay);
  }, [replayOn, text, scramble]);

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={hover ? () => scramble(text) : undefined}
    >
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
