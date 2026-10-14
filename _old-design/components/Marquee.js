"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { marquee } from "@/data/portfolio";

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Infinite ticker whose speed and direction react to scroll velocity.
function VelocityRow({ children, baseVelocity = 3 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 2000], [8, -8]);
  const direction = useRef(1);

  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex shrink-0" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex shrink-0" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  const items = (outline) =>
    marquee.map((m, i) => (
      <span key={m} className="flex items-center">
        <span className={`px-6 md:px-10 ${(i + (outline ? 1 : 0)) % 2 ? "text-outline" : ""}`}>{m}</span>
        <span className="text-accent">✦</span>
      </span>
    ));

  return (
    <section aria-label="Tools I work with" className="border-y border-line py-8 text-[11vw] leading-none font-medium tracking-tighter md:py-12 md:text-[7vw]">
      <VelocityRow baseVelocity={-2}>{items(false)}</VelocityRow>
      <VelocityRow baseVelocity={2}>
        <span className="font-serif font-normal italic">{items(true)}</span>
      </VelocityRow>
    </section>
  );
}
