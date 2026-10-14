"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { process } from "@/data/portfolio";

// Vertical scroll drives a horizontal track while the section is pinned.
export default function Process() {
  const ref = useRef(null);
  const track = useRef(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section ref={ref} aria-label="How I work" className="relative h-[300vh] bg-ink-2">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="flex items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span className="text-accent">(04)</span>
            <span className="h-px w-8 bg-current opacity-40" />
            <span>How I work</span>
          </div>
          <div className="h-px w-32 bg-line md:w-60">
            <motion.div className="h-full origin-left bg-accent" style={{ scaleX: bar }} />
          </div>
        </div>

        <motion.div ref={track} style={{ x }} className="mt-10 flex w-max gap-5 px-5 md:mt-14 md:gap-8 md:px-10">
          <div className="flex w-[80vw] shrink-0 flex-col justify-end md:w-[38vw]">
            <h2 className="text-6xl leading-[0.9] font-medium tracking-tighter md:text-[7vw]">
              A process
              <br />
              <span className="font-serif font-normal text-accent italic">built</span> for
              <br />
              results.
            </h2>
          </div>

          {process.map((step, i) => (
            <article
              key={step.title}
              className="group relative flex h-[60svh] w-[80vw] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-ink p-7 md:h-[62vh] md:w-[30vw] md:p-10"
            >
              <span className="absolute -right-4 -bottom-10 text-[14rem] leading-none font-medium tracking-tighter text-outline transition-transform duration-700 ease-expo group-hover:-translate-y-4 md:text-[18rem]">
                {i + 1}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Step 0{i + 1}</span>
              <div className="relative">
                <h3 className="text-4xl font-medium tracking-tight md:text-5xl">{step.title}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-paper/65">{step.text}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
