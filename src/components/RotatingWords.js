"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/theme";
import * as sound from "@/lib/sound";
import ScrambleText from "./ScrambleText";

const BACKGROUND_VOLUME = 0.3;

// Cycles through the words with a scramble effect, plus quiet keyboard
// clicks timed to each letter settling into place.
export default function RotatingWords({ words, interval = 2600, className = "" }) {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const visible = useRef(true);
  const list = words.filter(Boolean);

  // Only click when the headline is on screen (and not under the intro).
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [list.length, interval]);

  const word = list.length ? list[index % list.length] : "";

  // ScrambleText reveals letter i after roughly (10 + 2.5·i) frames at 60fps.
  useEffect(() => {
    if (index === 0 || !word || prefersReducedMotion()) return;
    const quiet = () => document.hidden || !visible.current || document.documentElement.dataset.intro;
    const timers = [...word].map((ch, i) =>
      setTimeout(() => !quiet() && sound.key(ch === " " ? "space" : "key", BACKGROUND_VOLUME), 170 + i * 42)
    );
    return () => timers.forEach(clearTimeout);
  }, [index, word]);

  if (!list.length) return null;
  return (
    <span ref={ref}>
      <ScrambleText text={word} className={className} />
    </span>
  );
}
