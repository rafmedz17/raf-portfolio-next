"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { projects } from "@/data/portfolio";
import { FadeIn, RevealWords, SectionLabel, ease } from "./ui/Reveal";

// Generated cover art so the site looks finished before you have screenshots.
// Swap for <Image /> once you add real project images to /public.
function ProjectArt({ project, index }) {
  const [a, b] = project.colors;
  return (
    <div
      className="relative flex size-full items-end overflow-hidden p-[6%]"
      style={{ background: `radial-gradient(120% 120% at 0% 0%, ${b} 0%, ${a} 45%, #0c0c0b 100%)` }}
    >
      <div className="absolute top-[12%] right-[8%] left-[18%] aspect-[16/10] rounded-lg bg-ink/85 p-[3%] shadow-2xl ring-1 ring-white/10">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-white/30" />
          <span className="size-1.5 rounded-full bg-white/30" />
          <span className="size-1.5 rounded-full bg-white/30" />
        </div>
        <div className="mt-[8%] h-[10%] w-1/2 rounded-sm" style={{ background: a }} />
        <div className="mt-[4%] h-[5%] w-3/4 rounded-sm bg-white/20" />
        <div className="mt-[3%] h-[5%] w-2/3 rounded-sm bg-white/20" />
        <div className="mt-[8%] grid grid-cols-3 gap-[4%]">
          {[0, 1, 2].map((k) => (
            <div key={k} className="aspect-square rounded-sm bg-white/10" />
          ))}
        </div>
      </div>
      <span className="relative font-mono text-[10px] uppercase tracking-widest text-ink/80">
        0{index + 1} / {project.title}
      </span>
    </div>
  );
}

export default function Work() {
  const [active, setActive] = useState({ on: false, index: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 });

  const onMove = (e) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };

  return (
    <section id="work" className="px-5 py-28 md:px-10 md:py-40" onPointerMove={onMove}>
      <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12">
        <SectionLabel index="03" className="md:col-span-3">
          Selected work
        </SectionLabel>
        <div className="flex items-start gap-3 md:col-span-9">
          <RevealWords as="h2" text="Recent projects" className="text-5xl font-medium tracking-tighter md:text-8xl" />
          <span className="font-mono text-sm text-accent">({String(projects.length).padStart(2, "0")})</span>
        </div>
      </div>

      <div className="hidden grid-cols-12 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:grid">
        <span className="col-span-1">No.</span>
        <span className="col-span-6">Project</span>
        <span className="col-span-4">Type</span>
        <span className="col-span-1 text-right">Year</span>
      </div>

      <ul className="border-t border-line" onPointerLeave={() => setActive((a) => ({ ...a, on: false }))}>
        {projects.map((p, i) => (
          <FadeIn as="li" key={p.title} delay={i * 0.06} y={20} className="border-b border-line">
            <a
              href={p.href}
              data-cursor="View"
              onPointerEnter={() => setActive({ on: true, index: i })}
              className={`group grid grid-cols-12 items-center gap-y-4 py-8 transition-opacity duration-500 md:py-12 ${
                active.on && active.index !== i ? "md:opacity-30" : ""
              }`}
            >
              <div className="col-span-12 aspect-[4/3] overflow-hidden rounded-xl md:hidden">
                <ProjectArt project={p} index={i} />
              </div>
              <span className="col-span-2 font-mono text-xs text-muted md:col-span-1">0{i + 1}</span>
              <h3 className="col-span-10 text-3xl font-medium tracking-tight transition-transform duration-700 ease-expo md:col-span-6 md:text-6xl md:group-hover:translate-x-6">
                {p.title}
              </h3>
              <span className="col-span-10 col-start-3 text-sm text-muted md:col-span-4 md:col-start-auto md:text-base">
                {p.category}
              </span>
              <span className="hidden text-right font-mono text-sm text-muted md:col-span-1 md:block">{p.year}</span>
            </a>
          </FadeIn>
        ))}
      </ul>

      {/* Floating preview — desktop only */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 hidden h-[300px] w-[400px] overflow-hidden rounded-xl md:block"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: active.on ? 1 : 0, opacity: active.on ? 1 : 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.div
          className="size-full"
          animate={{ y: `${-active.index * 100}%` }}
          transition={{ duration: 0.6, ease }}
        >
          {projects.map((p, i) => (
            <div key={p.title} className="size-full">
              <ProjectArt project={p} index={i} />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
