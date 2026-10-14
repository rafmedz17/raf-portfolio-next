"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

export const ease = [0.16, 1, 0.3, 1];

// A single line that slides up from behind a mask.
export function MaskLine({ children, show = true, delay = 0, className = "" }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "110%", rotate: 4 }}
        animate={show ? { y: "0%", rotate: 0 } : undefined}
        transition={{ duration: 1.2, ease, delay }}
        style={{ transformOrigin: "left bottom" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Splits text into words that rise in sequence when scrolled into view.
export function RevealWords({ text, className = "", delay = 0, stagger = 0.04, as: Tag = "p" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const MotionTag = motion[Tag];

  return (
    <MotionTag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-top">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 0.9, ease, delay: delay + i * stagger }}
          >
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function FadeIn({ children, delay = 0, y = 40, className = "", once = true, as = "div" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px" });
  const MotionTag = motion[as];
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </MotionTag>
  );
}

export function SectionLabel({ index, children, className = "" }) {
  return (
    <FadeIn y={12} className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted ${className}`}>
      <span className="text-accent">({index})</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </FadeIn>
  );
}
