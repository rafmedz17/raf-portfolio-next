import Reveal from "./Reveal";
import CopyEmail from "./CopyEmail";
import CommitForm from "./CommitForm";

export default function Contact({ profile, socials }) {
  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div>
          <Reveal>
            <p className="font-mono text-xs text-muted">
              <span className="text-accent">04</span> / contact
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Have a project or a role in mind?{" "}
              <span className="text-muted">Let&apos;s talk.</span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Write your message as a commit and push it straight to my inbox — or just
              email me the old-fashioned way. I usually reply within a day.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-medium transition-colors hover:bg-surface"
            >
              {profile.email}
            </a>
            <CopyEmail email={profile.email} />
          </Reveal>

          <Reveal delay={150} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
              >
                {s.label}
              </a>
            ))}
            {profile.resume && profile.resume !== "#" && (
              <a href={profile.resume} className="text-muted underline decoration-line underline-offset-4 hover:text-fg">
                Résumé
              </a>
            )}
          </Reveal>
        </div>

        <Reveal delay={120}>
          <CommitForm email={profile.email} name={profile.name} />
        </Reveal>
      </div>
    </section>
  );
}
