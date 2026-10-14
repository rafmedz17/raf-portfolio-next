import { profile, socials } from "@/data/portfolio";
import Terminal from "./Terminal";
import LocalTime from "./LocalTime";
import ScrambleText from "./ScrambleText";
import RotatingWords from "./RotatingWords";
import Spotlight from "./Spotlight";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Spotlight />

      <div className="relative mx-auto grid max-w-5xl gap-14 px-4 pt-20 pb-24 sm:px-6 md:pt-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
        <div>
          {profile.available && (
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1 font-mono text-xs text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {profile.availability}
            </p>
          )}

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Hi, I&apos;m{" "}
            <ScrambleText text={profile.name} hover className="cursor-default" />.
            <span className="mt-2 block text-muted">
              {profile.headlinePrefix}{" "}
              <RotatingWords words={profile.headlineWords} className="text-fg" />
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
            {profile.intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="inline-flex h-10 items-center rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              See my work
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-10 items-center rounded-md border border-line px-4 text-sm font-medium transition-colors hover:bg-surface"
            >
              Get in touch
            </a>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted">
            <div className="flex gap-2">
              <dt className="text-fg/60">role</dt>
              <dd>{profile.role.toLowerCase()}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg/60">based</dt>
              <dd>{profile.location}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg/60">local</dt>
              <dd>
                <LocalTime timeZone={profile.timeZone} />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-fg/60">find me</dt>
              <dd className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
                  >
                    {s.label.toLowerCase()}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <Terminal />
      </div>
    </section>
  );
}
