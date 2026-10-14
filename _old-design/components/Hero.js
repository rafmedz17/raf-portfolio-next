"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { profile } from "@/data/portfolio";
import { useSite } from "./Providers";
import Magnetic from "./ui/Magnetic";
import { MaskLine, ease } from "./ui/Reveal";

export default function Hero() {
  const { loaded } = useSite();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  // Soft glow that trails the pointer.
  const mx = useMotionValue(70);
  const my = useMotionValue(30);
  const gx = useSpring(mx, { stiffness: 40, damping: 20 });
  const gy = useSpring(my, { stiffness: 40, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(600px circle at ${gx}% ${gy}%, rgb(255 90 31 / 0.18), transparent 60%)`;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  const d = 0.15; // base delay after the preloader lifts

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      className="relative flex min-h-svh flex-col overflow-hidden px-5 pt-28 pb-8 md:px-10"
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #edeae3 1px, transparent 1px), linear-gradient(to bottom, #edeae3 1px, transparent 1px)",
          backgroundSize: "8vw 8vw",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <motion.div style={{ y, opacity, scale }} className="relative flex flex-1 flex-col">
        <div className="grid grid-cols-2 gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:grid-cols-4">
          {[profile.tagline, profile.location, "Portfolio ©" + new Date().getFullYear()].map((t, i) => (
            <motion.span
              key={t}
              className={i === 2 ? "hidden md:block" : ""}
              initial={{ opacity: 0, y: 10 }}
              animate={loaded ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease, delay: d + 0.6 + i * 0.08 }}
            >
              {t}
            </motion.span>
          ))}
          {profile.available && (
            <motion.span
              className="flex items-center gap-2 justify-self-end text-paper"
              initial={{ opacity: 0, y: 10 }}
              animate={loaded ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease, delay: d + 0.84 }}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {profile.availability}
            </motion.span>
          )}
        </div>

        <h1 className="mt-auto pt-16 text-[13.5vw] leading-[0.88] font-medium tracking-[-0.055em] md:text-[10.5vw]">
          <MaskLine show={loaded} delay={d}>
            Crafting
          </MaskLine>
          <MaskLine show={loaded} delay={d + 0.08} className="md:pl-[12vw]">
            <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">digital</span>{" "}
            worlds
          </MaskLine>
          <MaskLine show={loaded} delay={d + 0.16}>
            that feel <span className="font-serif font-normal tracking-[-0.02em] italic">alive.</span>
          </MaskLine>
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-base leading-relaxed text-paper/70 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: d + 0.5 }}
          >
            Hi, I&apos;m <span className="text-paper">{profile.name}</span> — {profile.intro}
          </motion.p>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: d + 0.6 }}
          >
            <Magnetic>
              <a
                href="#work"
                className="group relative flex h-14 items-center overflow-hidden rounded-full bg-paper px-7 text-sm font-medium text-ink"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                <span className="relative">View my work</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="flex h-14 items-center rounded-full border border-line px-7 text-sm font-medium transition-colors duration-300 hover:border-paper"
              >
                Let&apos;s talk
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="relative mt-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: d + 1 }}
      >
        <span>Scroll to explore</span>
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-paper"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
