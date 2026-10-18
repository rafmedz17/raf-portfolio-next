"use client";

import { useEffect, useState } from "react";
import { unlock } from "@/lib/achievements";
import Reveal from "./Reveal";
import ProjectShot from "./ProjectShot";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function ProjectLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/link inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent"
    >
      {label}
      <ArrowIcon />
    </a>
  );
}

// Moves a soft glow under the pointer without re-rendering.
function trackPointer(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

export default function ProjectList({ projects }) {
  const [tech, setTech] = useState(null);
  const allTech = [...new Set(projects.flatMap((p) => p.stack))].filter(Boolean).sort();

  const select = (next) => {
    setTech((current) => (current === next ? null : next));
    if (next) unlock("filter");
  };

  useEffect(() => {
    const onFilter = (e) => {
      setTech(e.detail);
      unlock("filter");
    };
    window.addEventListener("filter-tech", onFilter);
    return () => window.removeEventListener("filter-tech", onFilter);
  }, []);

  const matches = (p) => !tech || p.stack.includes(tech);
  const count = projects.filter(matches).length;

  return (
    <>
      <Reveal className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="mr-1 text-muted">
          $ grep <span className="text-fg">{tech ?? "*"}</span>
        </span>
        <button
          type="button"
          onClick={() => setTech(null)}
          className={`rounded-full border px-3 py-1 transition-colors ${!tech ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"}`}
        >
          all
        </button>
        {allTech.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => select(t)}
            aria-pressed={tech === t}
            className={`rounded-full border px-3 py-1 transition-colors ${tech === t ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-muted">
          {count} match{count === 1 ? "" : "es"}
        </span>
      </Reveal>

      <ul className="border-t border-line">
        {projects.map((project, i) => {
          const active = matches(project);
          return (
            <Reveal as="li" key={i} delay={i * 60} className="border-b border-line">
              <article
                onPointerMove={trackPointer}
                className={`group relative grid gap-4 overflow-hidden py-8 transition-opacity duration-300 md:grid-cols-[3rem_1fr_auto] md:gap-8 md:px-4 ${active ? "" : "opacity-25"}`}
              >
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
                  style={{ background: "radial-gradient(420px circle at var(--mx) var(--my), var(--accent-soft), transparent 65%)" }}
                  aria-hidden="true"
                />
                <span className="relative font-mono text-xs text-muted md:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  <h3 className="text-xl font-medium tracking-tight transition-transform duration-300 md:group-hover:translate-x-1">
                    {project.title}
                    <span className="ml-3 font-mono text-xs font-normal text-muted">{project.year}</span>
                  </h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">{project.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((t, ti) => (
                      <li key={ti}>
                        <button
                          type="button"
                          onClick={() => select(t)}
                          className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-colors ${t === tech ? "border-accent text-accent" : "border-line text-muted hover:text-fg"}`}
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative flex flex-col gap-4 md:items-end md:pt-1.5">
                  <div className="flex gap-4 md:flex-col md:items-end md:gap-2">
                    {project.repo && <ProjectLink href={project.repo} label="source" />}
                    {project.live && <ProjectLink href={project.live} label="live" />}
                  </div>
                  {project.image && <ProjectShot src={project.image} title={project.title} live={project.live} />}
                </div>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </>
  );
}
