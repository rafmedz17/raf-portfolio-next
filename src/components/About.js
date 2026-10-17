import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TechButton from "./TechButton";
import Photo from "./Photo";

// Camera-viewfinder corner marks around the portrait.
function Corners() {
  const corner = "absolute z-10 size-4 border-accent transition-all duration-500";
  return (
    <span aria-hidden="true">
      <span className={`${corner} -top-2 -left-2 border-t-2 border-l-2 group-hover:-top-3 group-hover:-left-3`} />
      <span className={`${corner} -top-2 -right-2 border-t-2 border-r-2 group-hover:-top-3 group-hover:-right-3`} />
      <span className={`${corner} -bottom-2 -left-2 border-b-2 border-l-2 group-hover:-bottom-3 group-hover:-left-3`} />
      <span className={`${corner} -right-2 -bottom-2 border-r-2 border-b-2 group-hover:-right-3 group-hover:-bottom-3`} />
    </span>
  );
}

function Portrait({ profile }) {
  const file = `${(profile.name || "me").toLowerCase().replace(/\s+/g, "-")}.jpg`;
  return (
    <figure className="group relative mx-auto w-full max-w-[300px] md:mx-0">
      <Corners />
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface">
        <Photo
          src={profile.photo}
          alt={profile.photoAlt || `Portrait of ${profile.fullName || profile.name}`}
          fill
          sizes="(min-width: 768px) 300px, 80vw"
          className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
        <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between font-mono text-[11px] text-white/85">
          <span>~/{file}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
            that&apos;s me
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

function NowList({ items }) {
  return (
    <>
      <p className="font-mono text-xs text-muted">{"// right now"}</p>
      <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between gap-4 py-3">
            <dt className="text-muted">{item.label}</dt>
            <dd className="text-right">{item.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export default function About({ profile, about, stack, projects }) {
  const usedInProjects = new Set(projects.flatMap((p) => p.stack));
  const paragraphs = (
    <div className="space-y-5 leading-relaxed text-muted">
      {about.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );

  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 md:py-32">
        <SectionHeading index="01" label="about" note="about" title="Practical engineer. Pragmatic about tools, picky about quality." />

        {profile.photo ? (
          <div className="grid gap-14 md:grid-cols-[260px_1fr] md:gap-16 lg:grid-cols-[300px_1fr]">
            <Reveal>
              <Portrait profile={profile} />
            </Reveal>
            <div>
              <Reveal delay={80}>{paragraphs}</Reveal>
              <Reveal delay={160} className="mt-10">
                <NowList items={about.now} />
              </Reveal>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
            <Reveal>{paragraphs}</Reveal>
            <Reveal delay={100}>
              <NowList items={about.now} />
            </Reveal>
          </div>
        )}

        <Reveal className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stack.map((group, gi) => (
            <div key={gi}>
              <p className="font-mono text-xs text-accent">{`// ${group.group}`}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.items.map((item, i) => (
                  <li key={i}>
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
