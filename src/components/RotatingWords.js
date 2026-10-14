"use client";

import { useEffect, useState } from "react";
import ScrambleText from "./ScrambleText";

export default function RotatingWords({ words, interval = 2600, className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return <ScrambleText text={words[index]} className={className} />;
}
