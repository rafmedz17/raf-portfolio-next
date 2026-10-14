"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/data/nav";
import ScrambleText from "./ScrambleText";

// Shows the current section as a shell path: ~/raf/work
export default function ActivePath({ name }) {
  const [section, setSection] = useState("");

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSection(entry.target.id === "top" ? "" : entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["top", ...ids].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <a href="#top" className="font-mono text-sm font-medium tracking-tight">
      <span className="text-accent">~/</span>
      {name.toLowerCase()}
      {section && (
        <span className="text-muted">
          /<ScrambleText text={section} />
        </span>
      )}
    </a>
  );
}
