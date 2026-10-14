"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { profile } from "@/data/portfolio";

const words = ["Hello", "Bonjour", "Ciao", "Hola", "Kamusta", "Hallo"];

export default function Preloader({ onComplete }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      onComplete();
      return;
    }
    const controls = animate(0, 100, {
      duration: 2.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setTimeout(() => setVisible(false), 250),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const word = words[Math.min(words.length - 1, Math.floor((count / 100) * words.length))];

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink-2 p-6 md:p-10"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex justify-between font-mono text-xs uppercase tracking-widest text-muted">
            <span>{profile.name}®</span>
            <span>Portfolio — {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-3 self-center">
            <span className="size-2 rounded-full bg-accent" />
            <span className="font-serif text-5xl italic md:text-7xl">{word}</span>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                Loading experience
              </span>
              <span className="text-[22vw] font-medium leading-[0.8] tracking-tighter tabular-nums md:text-[14vw]">
                {count}
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-line">
              <div className="h-full bg-accent" style={{ width: `${count}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
