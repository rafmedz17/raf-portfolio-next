"use client";

import { filterTech } from "@/lib/theme";

// A stack item that jumps to the Projects section filtered by this tech.
export default function TechButton({ tech }) {
  return (
    <button
      type="button"
      onClick={() => {
        filterTech(tech);
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="group inline-flex items-center gap-1.5 text-left transition-colors hover:text-accent"
      title={`Show projects using ${tech}`}
    >
      {tech}
      <span className="font-mono text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
        → projects
      </span>
    </button>
  );
}
