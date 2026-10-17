"use client";

import { useEffect, useRef } from "react";

// Lights up a dot grid around the mouse, anywhere on the page. It's a fixed,
// full-screen layer sitting behind all content (see .spotlight in globals.css).
export default function Spotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    const move = (e) => {
      if (e.pointerType !== "mouse") return; // no hover on touch screens
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const hide = (e) => {
      if (!e.relatedTarget) el.style.opacity = "0"; // mouse left the window
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseout", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseout", hide);
    };
  }, []);

  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}
