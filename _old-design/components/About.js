"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import { about } from "@/data/portfolio";
import { FadeIn, SectionLabel } from "./ui/Reveal";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

// Each word lights up as the paragraph scrolls through the viewport.
function ScrollParagraph({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="text-[7.5vw] leading-[1.12] font-medium tracking-tight md:text-[3.6vw]">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      <span className="text-accent">{suffix}</span>
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className="px-5 py-28 md:px-10 md:py-40">
      <div className="grid gap-10 md:grid-cols-12">
        <SectionLabel index="01" className="md:col-span-3">
          About me
        </SectionLabel>
        <div className="md:col-span-9">
          <ScrollParagraph text={about.statement} />
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 border-t border-line md:mt-36 md:grid-cols-4">
        {about.stats.map((s, i) => (
          <FadeIn
            key={s.label}
            delay={i * 0.1}
            className={`group border-line py-8 pr-4 ${i % 2 ? "pl-4 md:pl-6" : "md:pl-6"} border-b md:border-b-0 ${i ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""}`}
          >
            <div className="text-6xl font-medium tracking-tighter transition-transform duration-500 ease-expo group-hover:-translate-y-1 md:text-7xl">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <p className="mt-3 max-w-[14ch] text-sm text-muted">{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
