"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { navLinks, profile, socials } from "@/data/portfolio";
import { useSite } from "./Providers";
import Magnetic from "./ui/Magnetic";
import { ease } from "./ui/Reveal";

function RollLink({ href, children, onClick }) {
  // Text rolls up to reveal a copy of itself on hover.
  return (
    <a href={href} onClick={onClick} className="group relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full">
        {children}
      </span>
      <span className="absolute inset-0 block translate-y-full text-accent transition-transform duration-500 ease-expo group-hover:translate-y-0">
        {children}
      </span>
    </a>
  );
}

export default function Nav() {
  const { loaded } = useSite();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 200);
  });

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
        style={{ scaleX: progress }}
      />

      <motion.header
        className="fixed inset-x-0 top-0 z-40 px-5 py-5 mix-blend-difference md:px-10"
        initial={{ y: -80, opacity: 0 }}
        animate={loaded ? { y: hidden && !open ? -100 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease }}
      >
        <nav className="flex items-center justify-between text-sm text-paper">
          <a href="#top" className="group flex items-center gap-2 font-medium">
            <span className="inline-block transition-transform duration-700 ease-expo group-hover:rotate-[360deg]">
              ©
            </span>
            <span>Code by {profile.name}</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <RollLink href={l.href}>{l.label}</RollLink>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setOpen((o) => !o)}
            className="relative z-50 flex items-center gap-2 font-mono text-xs uppercase tracking-widest md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-between bg-ink-2 px-5 pt-28 pb-8 md:hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-2">
              {navLinks.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 text-5xl font-medium tracking-tight"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.06 }}
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating menu shortcut on desktop once the header hides */}
      <AnimatePresence>
        {hidden && (
          <motion.div
            className="fixed top-6 right-6 z-40 hidden md:block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <Magnetic>
              <a
                href="#top"
                data-cursor="Top"
                className="flex size-16 items-center justify-center rounded-full bg-accent text-ink"
                aria-label="Back to top"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </a>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
