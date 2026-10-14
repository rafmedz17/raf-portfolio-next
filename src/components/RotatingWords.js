"use client";

import { useEffect, useState } from "react";
import ScrambleText from "./ScrambleText";

export default function RotatingWords({ words, interval = 2600, className = "" }) {
  const [index, setIndex] = useState(0);
  const list = words.filter(Boolean);

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [list.length, interval]);

  if (!list.length) return null;
  return <ScrambleText text={list[index % list.length]} className={className} />;
}
