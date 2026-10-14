import { about, projects, stack } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TechButton from "./TechButton";

const usedInProjects = new Set(projects.flatMap((p) => p.stack));

export default function About() {
  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 md:py-32">
        <SectionHeading index="01" label="about" title="Practical engineer. Pragmatic about tools, picky about quality." />

        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <Reveal className="space-y-5 leading-relaxed text-muted">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={100}>
            <p className="font-mono text-xs text-muted">{"// right now"}</p>
            <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
              {about.now.map((item) => (
                <div key={item.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="text-right">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stack.map((group) => (
            <div key={group.group}>
              <p className="font-mono text-xs text-accent">{`// ${group.group}`}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item}>
                    {usedInProjects.has(item) ? <TechButton tech={item} /> : item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
