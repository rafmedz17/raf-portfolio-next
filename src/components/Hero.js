import Terminal from "./Terminal";
import LocalTime from "./LocalTime";
import ScrambleText from "./ScrambleText";
import RotatingWords from "./RotatingWords";
import ResumeButton from "./ResumeButton";
import ContactButton from "./ContactButton";
import DevNote from "./DevNote";

export default function Hero({ content }) {
  const { profile, socials } = content;
  const hasResume = profile.resume && profile.resume !== "#";
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-5xl gap-14 px-4 pt-20 pb-24 sm:px-6 md:pt-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
        <div>
          {profile.available && (
            <p className="hero-in inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1 font-mono text-xs text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {profile.availability}
            </p>
          )}
          <DevNote id="headline" className="ml-3" />

          <h1 className="hero-in mt-6 text-4xl font-semibold tracking-tight sm:text-5xl" style={{ "--d": 1 }}>
            Hi, I&apos;m{" "}
            <ScrambleText text={profile.name} hover replayOn="intro:done" className="cursor-default" />.
            {/* Every version of the line is stacked in one grid cell (only the
                live one is visible), so the headline always reserves the
                height of its tallest version and never makes the page jump. */}
            <span className="mt-2 grid text-muted">
              {profile.headlineWords.filter(Boolean).map((word, i) => (
                <span key={i} className="invisible [grid-area:1/1]" aria-hidden="true">
                  {profile.headlinePrefix} <span>{word}</span>
                </span>
              ))}
              <span className="[grid-area:1/1]">
                {profile.headlinePrefix}{" "}
                <RotatingWords words={profile.headlineWords} className="text-fg" />
              </span>
            </span>
          </h1>

          <p className="hero-in mt-6 max-w-lg text-base leading-relaxed text-muted" style={{ "--d": 2 }}>
            {profile.intro}
          </p>

          <div className="hero-in mt-8 flex flex-wrap items-center gap-3" style={{ "--d": 3 }}>
            <a
              href="#work"
              className="inline-flex h-10 items-center rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              See my work
            </a>
            <ContactButton className="inline-flex h-10 items-center rounded-md border border-line px-4 text-sm font-medium transition-colors hover:bg-surface">
              Get in touch
            </ContactButton>
            {hasResume && (
              <ResumeButton className="group inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:text-fg">
                <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4v12m-5-5 5 5 5-5M4 20h16" />
                </svg>
                Résumé
              </ResumeButton>
            )}
          </div>

          <dl className="hero-in mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted" style={{ "--d": 4 }}>
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
                {socials.map((s, i) => (
                  <a
                    key={i}
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

        <div className="hero-in relative" style={{ "--d": 3 }}>
          <DevNote id="terminal" align="right" className="absolute -top-9 right-0" />
          <Terminal content={content} />
        </div>
      </div>
    </section>
  );
}
