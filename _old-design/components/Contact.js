"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { profile, socials } from "@/data/portfolio";
import { useSite } from "./Providers";
import Magnetic from "./ui/Magnetic";
import { RevealWords, ease } from "./ui/Reveal";

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time || "—"}</span>;
}

export default function Contact() {
  const ref = useRef(null);
  const { lenis } = useSite();
  const [copied, setCopied] = useState(false);

  // The light panel rises with rounded corners that flatten as it settles.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const radius = useTransform(scrollYProgress, [0, 1], ["4rem", "0rem"]);
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const toTop = () => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }));

  return (
    <motion.section
      id="contact"
      ref={ref}
      style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      className="relative overflow-hidden bg-paper text-ink"
    >
      <motion.div style={{ y }} className="px-5 pt-28 pb-10 md:px-10 md:pt-40">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          <span className="text-accent">(06)</span>
          <span className="h-px w-8 bg-current opacity-40" />
          <span>Contact</span>
        </div>

        <div className="relative mt-10">
          <RevealWords
            as="h2"
            text="Have a project in mind?"
            className="text-[12vw] leading-[0.95] font-medium tracking-[-0.05em] md:text-[8.5vw]"
          />
          <RevealWords
            as="p"
            delay={0.2}
            text="Let's build it."
            className="font-serif text-[12vw] leading-[0.95] tracking-[-0.03em] text-accent italic md:text-[8.5vw]"
          />

          <div className="mt-12 md:absolute md:right-[6%] md:bottom-0 md:mt-0">
            <Magnetic strength={0.5}>
              <a
                href={`mailto:${profile.email}`}
                data-cursor="Say hi"
                className="group relative flex size-40 items-center justify-center overflow-hidden rounded-full bg-ink text-paper md:size-52"
              >
                <span className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-700 ease-expo group-hover:scale-100" />
                <span className="relative text-center text-sm font-medium md:text-base">
                  Get in
                  <br />
                  touch
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ink/15 pt-10 md:mt-24 md:flex-row md:items-center">
          <button
            onClick={copy}
            data-cursor="Copy"
            className="group relative flex items-center gap-4 rounded-full border border-ink/20 px-6 py-4 text-lg transition-colors duration-300 hover:border-ink md:text-2xl"
          >
            {profile.email}
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Click to copy</span>
            <AnimatePresence>
              {copied && (
                <motion.span
                  className="absolute -top-10 left-6 rounded-full bg-ink px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-paper"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease }}
                >
                  Copied ✓
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <footer className="mt-24 grid gap-8 text-sm md:mt-32 md:grid-cols-12 md:items-end">
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Local time</p>
            <p className="mt-2">
              <Clock />
            </p>
          </div>
          <div className="md:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Socials</p>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="group relative inline-block">
                    {s.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end justify-between md:col-span-3 md:justify-end md:gap-6">
            <span className="text-ink/50">
              © {new Date().getFullYear()} {profile.name}
            </span>
            <button onClick={toTop} className="font-medium underline-offset-4 hover:underline">
              Back to top ↑
            </button>
          </div>
        </footer>
      </motion.div>

      <div aria-hidden className="pointer-events-none mt-6 overflow-hidden px-2 leading-[0.75] select-none">
        <p className="text-center text-[34vw] font-medium tracking-[-0.08em] text-ink/[0.06]">{profile.name}</p>
      </div>
    </motion.section>
  );
}
