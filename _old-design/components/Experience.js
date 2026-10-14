"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { experience } from "@/data/portfolio";
import { RevealWords, SectionLabel, ease } from "./ui/Reveal";

function Row({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <li ref={ref} className="group relative grid gap-4 py-10 md:grid-cols-12 md:py-12">
      <motion.span
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.4, ease, delay: index * 0.1 }}
      />
      <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-expo group-hover:scale-x-100" />
      <motion.div
        className="grid gap-4 md:col-span-12 md:grid-cols-12"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-muted md:col-span-3">{item.period}</span>
        <div className="md:col-span-5">
          <h3 className="text-2xl font-medium tracking-tight transition-colors duration-500 group-hover:text-accent md:text-3xl">
            {item.role}
          </h3>
          <p className="mt-1 font-serif text-xl text-muted italic">{item.company}</p>
        </div>
        <p className="leading-relaxed text-paper/65 md:col-span-4">{item.text}</p>
      </motion.div>
    </li>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="px-5 py-28 md:px-10 md:py-40">
      <div className="mb-16 grid gap-8 md:mb-20 md:grid-cols-12">
        <SectionLabel index="05" className="md:col-span-3">
          Experience
        </SectionLabel>
        <div className="md:col-span-9">
          <RevealWords as="h2" text="Where I've been" className="text-5xl font-medium tracking-tighter md:text-8xl" />
        </div>
      </div>
      <ul className="border-b border-line">
        {experience.map((item, i) => (
          <Row key={item.role} item={item} index={i} />
        ))}
      </ul>
    </section>
  );
}
