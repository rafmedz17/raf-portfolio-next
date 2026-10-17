// "Director's commentary" — short notes on how each part of the site was
// built. They only appear in god mode (Konami code). Edit freely.
export const DEV_NOTES = {
  headline: {
    title: "The scrambling text",
    body: "Your name and the rotating words decrypt with a requestAnimationFrame loop: every letter locks in on a staggered frame. The quiet key clicks are timed to land as each letter settles.",
  },
  terminal: {
    title: "A real terminal",
    body: "A React component with a command lookup table built from the site's content, command history (↑ ↓), tab completion and a canvas Snake game. Every sound is synthesized live with the Web Audio API, so there are zero audio files.",
  },
  about: {
    title: "Fast photos",
    body: "The portrait goes through next/image: 57 KB in, about 16 KB out, resized for each screen and lazy-loaded. The viewfinder corners are pure CSS.",
  },
  work: {
    title: "Filters without layout shift",
    body: "The filter chips are generated from the project tags. Unmatched projects dim instead of disappearing, so nothing jumps around. The hover glow follows the cursor through CSS variables, with zero React re-renders.",
  },
  experience: {
    title: "Real-looking commits",
    body: "Each commit hash is an FNV-1a hash of the job's details. It's deterministic, so the same job always gets the same hash on every build.",
  },
  contact: {
    title: "Contact form → inbox",
    body: "A Next.js Server Action stores messages in Upstash Redis. Spam protection: a hidden honeypot field plus a rate limit of 5 per hour per hashed IP. Messages land in a password-protected admin inbox.",
  },
  cms: {
    title: "A hidden CMS",
    body: "Everything on this site is editable from a private admin page I built: content lives in one JSON file, with a live preview, undo/redo, photo and PDF uploads, and saves that commit to GitHub to trigger a redeploy.",
  },
};
