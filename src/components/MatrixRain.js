"use client";

import { useEffect, useRef, useState } from "react";
import { cssVar } from "@/lib/theme";

const GLYPHS = "01{}[]<>/=;:+*#$&アイウエオカキクケコサシスセソ";
const DURATION = 4500;

export default function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const size = 16;
    const drops = Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -40);
    const accent = cssVar("--accent");
    const font = `${size}px ${cssVar("--font-geist-mono")}, monospace`;
    let raf;
    let last = 0;

    const draw = (t) => {
      if (t - last > 45) {
        last = t;
        // Fade previous frame to leave trails, whatever the page background is.
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = accent;
        ctx.font = font;
        drops.forEach((y, i) => {
          ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * size, y * size);
          drops[i] = y * size > h && Math.random() > 0.96 ? 0 : y + 1;
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const fade = setTimeout(() => setFading(true), DURATION - 800);
    const done = setTimeout(onDone, DURATION);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[70] transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
      <div className="absolute inset-0 grid place-items-center">
        <p className="rounded-md border border-accent bg-bg/90 px-5 py-3 font-mono text-sm text-accent shadow-2xl backdrop-blur">
          cheat code accepted — god mode: on
        </p>
      </div>
    </div>
  );
}
