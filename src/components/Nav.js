import { navLinks } from "@/data/nav";
import ThemeToggle from "./ThemeToggle";
import CommandButton from "./CommandButton";
import ActivePath from "./ActivePath";
import ResumeButton from "./ResumeButton";

export default function Nav({ profile }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <ActivePath name={profile.name} />

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-6 text-sm text-muted md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-fg">
                  {link.label}
                </a>
              </li>
            ))}
            {profile.resume && profile.resume !== "#" && (
              <li>
                <ResumeButton className="rounded-full border border-line px-3 py-1 text-xs text-fg transition-colors hover:border-accent hover:text-accent">
                  Résumé
                </ResumeButton>
              </li>
            )}
          </ul>
          <CommandButton />
          <ThemeToggle />
        </div>
      </nav>
      <div className="scroll-progress absolute inset-x-0 -bottom-px h-px bg-accent" aria-hidden="true" />
    </header>
  );
}
