import AchievementCounter from "./AchievementCounter";

export default function Footer({ profile }) {
  return (
    <footer id="site-footer" className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.fullName}. Built with Next.js &amp; too much coffee.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p>
            <span className="text-accent">tip:</span> press <kbd className="rounded border border-line px-1">Ctrl K</kbd>
          </p>
          <AchievementCounter />
        </div>
      </div>
    </footer>
  );
}
