import { experience } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

// Deterministic fake commit hash so each entry looks like a git log line.
function shortHash(input) {
  let h = 2166136261;
  for (const ch of input) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

export default function Experience() {
  return (
    <section id="experience" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 md:py-32">
        <SectionHeading index="03" label="experience" title="git log --career" />

        <ol className="relative font-mono text-sm">
          {experience.map((job, i) => (
            <Reveal as="li" key={job.period + job.role} delay={i * 80} className="relative grid grid-cols-[1.25rem_1fr] gap-x-3 pb-12 last:pb-0">
              {/* graph line + node */}
              <span className="relative flex justify-center" aria-hidden="true">
                <span className={`absolute top-6 bottom-[-0.25rem] w-px bg-line ${i === experience.length - 1 ? "hidden" : ""}`} />
                <span className={`relative mt-1.5 size-2.5 rounded-full border-2 ${job.current ? "border-accent bg-accent" : "border-muted bg-bg"}`} />
              </span>

              <div>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-hash">commit {shortHash(job.role + job.company + job.period)}</span>
                  {job.current && (
                    <span className="text-muted">
                      (<span className="text-accent">HEAD -&gt; present</span>)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted">Date: {job.period}</p>

                <div className="mt-4 pl-4 font-sans">
                  <h3 className="text-lg font-medium tracking-tight">
                    {job.role} <span className="text-muted">@ {job.company}</span>
                  </h3>
                  <p className="mt-2 max-w-2xl leading-relaxed text-muted">{job.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
