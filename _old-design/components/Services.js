"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { services } from "@/data/portfolio";
import { FadeIn, RevealWords, SectionLabel, ease } from "./ui/Reveal";

export default function Services() {
  const [open, setOpen] = useState(0);

  return (
    <section id="services" className="px-5 py-28 md:px-10 md:py-40">
      <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12">
        <SectionLabel index="02" className="md:col-span-3">
          Services
        </SectionLabel>
        <div className="md:col-span-9">
          <RevealWords
            as="h2"
            text="What I can do for you"
            className="text-5xl font-medium tracking-tighter md:text-8xl"
          />
        </div>
      </div>

      <ul className="border-t border-line">
        {services.map((s, i) => {
          const active = open === i;
          return (
            <FadeIn as="li" key={s.title} delay={i * 0.06} y={20} className="border-b border-line">
                <button
                  onClick={() => setOpen(active ? -1 : i)}
                  aria-expanded={active}
                  className="group relative flex w-full items-center gap-6 overflow-hidden py-8 text-left md:gap-12 md:py-10"
                >
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-expo group-hover:scale-y-100" />
                  <span className="relative font-mono text-xs text-accent md:w-24 md:pl-4">0{i + 1}</span>
                  <span className="relative flex-1 text-3xl font-medium tracking-tight transition-all duration-500 ease-expo group-hover:translate-x-3 group-hover:text-ink md:text-6xl">
                    {s.title}
                  </span>
                  <motion.span
                    className="relative mr-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-ink group-hover:text-ink md:mr-4 md:size-14"
                    animate={{ rotate: active ? 45 : 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pl-36">
                        <p className="max-w-xl text-lg leading-relaxed text-paper/70">{s.description}</p>
                        <div className="flex flex-wrap gap-2 md:pr-4">
                          {s.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-line px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </FadeIn>
          );
        })}
      </ul>
    </section>
  );
}
